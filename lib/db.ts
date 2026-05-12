import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "family.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      generation INTEGER,
      sibling_order INTEGER,
      father_id INTEGER REFERENCES family_members(id),
      mother_id INTEGER REFERENCES family_members(id),
      mother_name TEXT,
      gender TEXT CHECK (gender IN ('男', '女')),
      official_position TEXT,
      is_alive INTEGER DEFAULT 1,
      is_root INTEGER DEFAULT 0,
      spouse TEXT,
      remarks TEXT,
      birthday TEXT,
      death_date TEXT,
      residence_place TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS spouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      spouse_member_id INTEGER REFERENCES family_members(id),
      name TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      end_reason TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_family_members_father_id ON family_members(father_id);
    CREATE INDEX IF NOT EXISTS idx_family_members_name ON family_members(name);
    CREATE INDEX IF NOT EXISTS idx_spouses_member_id ON spouses(member_id);
  `);

  // 迁移已有数据库：新增列
  migrateDb(db);
}

function migrateDb(db: Database.Database) {
  // 检查并添加 mother_id 列
  const columns = db.prepare("PRAGMA table_info(family_members)").all() as { name: string }[];
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has("mother_id")) {
    db.exec("ALTER TABLE family_members ADD COLUMN mother_id INTEGER REFERENCES family_members(id)");
  }
  if (!columnNames.has("mother_name")) {
    db.exec("ALTER TABLE family_members ADD COLUMN mother_name TEXT");
  }
  if (!columnNames.has("is_root")) {
    db.exec("ALTER TABLE family_members ADD COLUMN is_root INTEGER DEFAULT 0");
  }

  // 迁移现有 spouse 数据到 spouses 表（仅当 spouses 表为空且有旧数据时）
  const spouseCount = db.prepare("SELECT COUNT(*) as count FROM spouses").get() as { count: number };
  if (spouseCount.count === 0) {
    const membersWithSpouse = db
      .prepare("SELECT id, spouse FROM family_members WHERE spouse IS NOT NULL AND spouse != ''")
      .all() as { id: number; spouse: string }[];

    if (membersWithSpouse.length > 0) {
      const insert = db.prepare(
        "INSERT INTO spouses (member_id, name, sort_order) VALUES (?, ?, 0)"
      );
      const migrate = db.transaction(() => {
        for (const m of membersWithSpouse) {
          insert.run(m.id, m.spouse);
        }
      });
      migrate();
    }
  }
}
