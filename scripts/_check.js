// 数据库状态检查工具
// 用法: node scripts/_check.js

const fs = require("fs");

const DB_PATH = process.env.DB_PATH || "/app/data/family.db";

(async () => {
  const initSqlJs = (await import("sql.js")).default;
  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_PATH)) {
    console.log("数据库文件不存在:", DB_PATH);
    process.exit(1);
  }

  const buf = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buf);

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  if (tables.length > 0) {
    tables[0].values.forEach((r) => console.log("表:", r[0]));
  }

  const fc = db.prepare("SELECT COUNT(*) as c FROM family_members");
  if (fc.step()) console.log("成员数:", fc.getAsObject().c);
  fc.free();

  const uc = db.prepare("SELECT COUNT(*) as c FROM users");
  if (uc.step()) console.log("用户数:", uc.getAsObject().c);
  uc.free();

  db.close();
})();
