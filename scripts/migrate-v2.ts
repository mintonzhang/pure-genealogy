/**
 * 数据迁移脚本：v2 配偶和母亲字段升级
 *
 * 功能：
 * 1. family_members 表新增 mother_id、mother_name 列
 * 2. 新建 spouses 表
 * 3. 将现有 spouse 字段数据迁移到 spouses 表
 *
 * 注意：此迁移已内嵌在 lib/db.ts 的 migrateDb() 中自动执行，
 * 本脚本仅用于手动执行或数据修复场景。
 *
 * 运行方式：npx tsx scripts/migrate-v2.ts
 */

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "family.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("开始数据迁移...");

// 1. 检查并添加 mother_id 列
const columns = db.prepare("PRAGMA table_info(family_members)").all() as { name: string }[];
const columnNames = new Set(columns.map((c) => c.name));

if (!columnNames.has("mother_id")) {
  db.exec("ALTER TABLE family_members ADD COLUMN mother_id INTEGER REFERENCES family_members(id)");
  console.log("  ✓ 添加 mother_id 列");
} else {
  console.log("  - mother_id 列已存在");
}

if (!columnNames.has("mother_name")) {
  db.exec("ALTER TABLE family_members ADD COLUMN mother_name TEXT");
  console.log("  ✓ 添加 mother_name 列");
} else {
  console.log("  - mother_name 列已存在");
}

// 2. 检查并创建 spouses 表
const tableExists = db.prepare(
  "SELECT name FROM sqlite_master WHERE type='table' AND name='spouses'"
).get();

if (!tableExists) {
  db.exec(`
    CREATE TABLE spouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
      spouse_member_id INTEGER REFERENCES family_members(id),
      name TEXT NOT NULL,
      start_date TEXT,
      end_date TEXT,
      end_reason TEXT,
      sort_order INTEGER DEFAULT 0
    );
    CREATE INDEX idx_spouses_member_id ON spouses(member_id);
  `);
  console.log("  ✓ 创建 spouses 表");
} else {
  console.log("  - spouses 表已存在");
}

// 3. 迁移现有配偶数据
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
    console.log(`  ✓ 迁移 ${membersWithSpouse.length} 条配偶数据`);
  } else {
    console.log("  - 无配偶数据需要迁移");
  }
} else {
  console.log("  - 配偶数据已迁移");
}

console.log("\n迁移完成！");
db.close();
