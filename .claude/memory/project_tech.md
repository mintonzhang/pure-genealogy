---
name: 项目技术栈与数据库
description: 项目技术栈、数据库位置、迁移模式等关键信息
type: project
originSessionId: 406ff4f5-e08d-4325-911f-579212ce9bd3
---
## 技术栈
- Next.js 15 (App Router, Turbopack)，TypeScript
- SQLite (better-sqlite3)，已从 Supabase 迁移
- 数据库文件：`data/family.db`
- shadcn/ui + Tailwind CSS + lucide-react
- 2D 图谱：@xyflow/react + dagre 自动布局
- 3D 图谱：react-force-graph-3d
- 统计图表：recharts
- 包管理器：pnpm

## 数据库信息
- 位置：`data/family.db`（SQLite WAL 模式）
- 连接方式：`lib/db.ts` 中 `getDb()` 单例
- 自动迁移：`migrateDb()` 检查 PRAGMA table_info 后 ALTER TABLE
- 查询方式：`db.prepare(sql).all()` / `.get()` / `.run()`
- 有外键但未启用 PRAGMA foreign_keys = ON（已设置）

## 数据现状
- 当前 98 位成员，27 条配偶记录
- 朱元璋为 is_root，26 个儿子全部录入
- 各藩王支系逐代追踪至 6-10 代
