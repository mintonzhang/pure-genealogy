#!/usr/bin/env node

/**
 * 容器初始化脚本
 * 根据环境变量 ADMIN_USERNAME / ADMIN_PASSWORD 自动创建管理员账号
 * 若用户已存在则跳过
 */

const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "family.db");
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

async function main() {
  console.log(`[init-admin] 正在连接到数据库: ${DB_PATH}`);

  try {
    // bcryptjs 和 sql.js 使用 ESM import（standalone 模式仅含 ESM 入口）
    const bcrypt = (await import("bcryptjs")).default;
    const initSqlJs = (await import("sql.js")).default;

    const SQL = await initSqlJs();

    // 确保数据目录存在
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 加载已有数据库或创建新库
    let database;
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      database = new SQL.Database(buffer);
    } else {
      database = new SQL.Database();
    }

    // 确保 users 表存在
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // email → username 迁移：检测旧表结构并重命名
    const tableInfo = database.exec("PRAGMA table_info(users)");
    if (tableInfo.length > 0) {
      const columns = tableInfo[0].values.map(r => r[1]); // column name is index 1
      if (!columns.includes("username") && columns.includes("email")) {
        console.log("[init-admin] 检测到旧 email 列，正在迁移为 username...");
        database.run("ALTER TABLE users RENAME COLUMN email TO username");
      }
    }

    // 检查用户是否已存在
    const checkStmt = database.prepare("SELECT id FROM users WHERE username = ?");
    checkStmt.bind([ADMIN_USERNAME]);
    let existing = false;
    if (checkStmt.step()) {
      existing = true;
    }
    checkStmt.free();

    if (existing) {
      console.log(`[init-admin] 管理员 ${ADMIN_USERNAME} 已存在，跳过创建`);
      database.close();
      process.exit(0);
    }

    // 创建管理员账号
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    database.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [ADMIN_USERNAME, passwordHash]);

    // 原子化写入：先写临时文件再 rename，防止写入中断损坏数据库
    const tmpPath = DB_PATH + ".tmp";
    fs.writeFileSync(tmpPath, Buffer.from(database.export()));
    fs.renameSync(tmpPath, DB_PATH);
    console.log(`[init-admin] 管理员账号创建成功: ${ADMIN_USERNAME}`);

    database.close();
  } catch (err) {
    console.error("[init-admin] 初始化失败:", err.message);
    // 不直接 exit(1)，留给 entrypoint 决定是否继续
    throw err;
  }
}

main().catch((err) => {
  console.error("[init-admin] 未捕获错误:", err.message);
  process.exit(1);
});
