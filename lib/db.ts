import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "family.db");

let db: SqlJsDatabase | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function loadSQL() {
  if (!SQL) SQL = await initSqlJs();
  return SQL;
}

function saveToDisk() {
  if (!db) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// 封装 sql.js 以匹配 better-sqlite3 API
class SqlJsWrapper {
  constructor(private database: SqlJsDatabase) {}

  prepare(sql: string) {
    const stmt = this.database.prepare(sql);
    const self = this;

    return {
      all(...params: unknown[]) {
        if (params.length) stmt.bind(params as import("sql.js").SqlValue[]);
        const results: unknown[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      get(...params: unknown[]) {
        if (params.length) stmt.bind(params as import("sql.js").SqlValue[]);
        let result: unknown = undefined;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      run(...params: unknown[]) {
        if (params.length) stmt.bind(params as import("sql.js").SqlValue[]);
        stmt.step();
        stmt.free();
        const lastRow = self.execSelect("SELECT last_insert_rowid() as id")[0] as Record<string, unknown> | undefined;
        const lastId = lastRow?.id as number | undefined;
        saveToDisk();
        return { lastInsertRowid: lastId, changes: self.getRowsModified() };
      },
      free() {
        stmt.free();
      },
    };
  }

  exec(sql: string) {
    this.database.run(sql);
    saveToDisk();
  }

  // 用于 SELECT 类 exec（如 last_insert_rowid、PRAGMA）
  private execSelect(sql: string): unknown[] {
    const results: unknown[] = [];
    const stmt = this.database.prepare(sql);
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  // 获取 PRAGMA table_info 结果
  getTableInfo(table: string): { name: string }[] {
    const raw = this.database.exec(`PRAGMA table_info(${table})`);
    if (!raw.length) return [];
    const columns = raw[0].columns;
    const nameIdx = columns.indexOf("name");
    return raw[0].values.map((row) => ({ name: row[nameIdx] as string }));
  }

  getRowsModified(): number {
    return this.database.getRowsModified();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  transaction(fn: Function): (...args: unknown[]) => unknown {
    const self = this;
    return (...args: unknown[]) => {
      self.exec("BEGIN");
      try {
        const result = fn(...args);
        self.exec("COMMIT");
        return result;
      } catch (e) {
        self.exec("ROLLBACK");
        throw e;
      }
    };
  }

  close() {
    this.database.close();
  }
}

export async function getDb(): Promise<SqlJsWrapper> {
  if (!db) {
    const sql = await loadSQL();

    // 确保数据目录存在
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 加载已有数据库或创建新库
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new sql.Database(buffer);
    } else {
      db = new sql.Database();
    }

    db.run("PRAGMA foreign_keys = ON");
    const wrapper = new SqlJsWrapper(db);
    initTables(wrapper);
  }
  return new SqlJsWrapper(db);
}

function initTables(wrapper: SqlJsWrapper) {
  wrapper.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
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

  migrateDb(wrapper);
  saveToDisk();
}

function migrateDb(wrapper: SqlJsWrapper) {
  const columns = wrapper.getTableInfo("family_members");
  const columnNames = new Set(columns.map((c) => c.name));

  if (!columnNames.has("mother_id")) {
    wrapper.exec("ALTER TABLE family_members ADD COLUMN mother_id INTEGER REFERENCES family_members(id)");
  }
  if (!columnNames.has("mother_name")) {
    wrapper.exec("ALTER TABLE family_members ADD COLUMN mother_name TEXT");
  }
  if (!columnNames.has("is_root")) {
    wrapper.exec("ALTER TABLE family_members ADD COLUMN is_root INTEGER DEFAULT 0");
  }

  // email → username 迁移
  const userColumns = wrapper.getTableInfo("users");
  const userColumnNames = new Set(userColumns.map((c) => c.name));
  if (!userColumnNames.has("username") && userColumnNames.has("email")) {
    wrapper.exec("ALTER TABLE users RENAME COLUMN email TO username");
  }

  const spouseCount = wrapper.prepare("SELECT COUNT(*) as count FROM spouses").get() as { count: number } | undefined;
  if (spouseCount && spouseCount.count === 0) {
    const membersWithSpouse = wrapper
      .prepare("SELECT id, spouse FROM family_members WHERE spouse IS NOT NULL AND spouse != ''")
      .all() as { id: number; spouse: string }[];

    if (membersWithSpouse.length > 0) {
      const insert = wrapper.prepare("INSERT INTO spouses (member_id, name, sort_order) VALUES (?, ?, 0)");
      const migrate = wrapper.transaction(() => {
        for (const m of membersWithSpouse) {
          insert.run(m.id, m.spouse);
        }
      });
      migrate();
    }
  }
}
