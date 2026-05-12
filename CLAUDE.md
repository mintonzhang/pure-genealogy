# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 Next.js 15 (App Router) 的家族族谱管理 Web 应用，TypeScript 开发，Supabase (PostgreSQL + Auth) 作为后端。

## 开发命令

```bash
npm run dev     # 启动开发服务器 (localhost:3000)
npm run build   # 生产构建
npm run lint    # ESLint 检查
```

## 技术栈

- **框架**: Next.js 15 (App Router, RSC, Server Actions)
- **后端**: Supabase (PostgreSQL + Auth)，自引用 `family_members` 表通过 `father_id` 构建树形结构
- **UI**: shadcn/ui (new-york 风格) + Tailwind CSS + lucide-react 图标
- **可视化**: @xyflow/react (2D 族谱), react-force-graph-3d (3D 力导向图), recharts (统计图表)
- **富文本**: Slate.js (生事迹编辑器)
- **主题**: next-themes 明暗模式，语言 zh-CN

## 路径别名

```typescript
@/components/ui  → components/ui/     (shadcn 组件)
@/components/rich-text → components/rich-text/  (富文本编辑器)
@/lib             → lib/
@/hooks           → hooks/
```

## Supabase 客户端规范（关键）

项目有 4 个 Supabase 文件，**必须根据上下文选择正确的客户端**：

| 场景 | 文件 | 调用方式 |
|------|------|----------|
| Client Component | `lib/supabase/client.ts` | `createClient()` 同步 |
| Server Component / Server Actions / Route Handler | `lib/supabase/server.ts` | `await createClient()` 异步 |
| Middleware (认证) | `lib/supabase/middleware.ts` | `updateSession(request)` |
| 入口代理 | `proxy.ts` | 导入 middleware 的 `updateSession` |

- **不要**在全局变量中缓存 Supabase 客户端，每次请求创建新实例
- Server Component 中认证检查使用 `supabase.auth.getClaims()`（比 `getUser()` 更快）
- Middleware 中 `createServerClient` 和 `getClaims()` 之间不要插入代码

## 架构模式

### Server Component + Client Component 分离

参考 `app/family-tree/` 目录的标准模式：
- `page.tsx` — 页面入口，用 `Suspense` 包裹加载组件
- `*-loader.tsx` — Server Component，负责数据获取
- `*-table.tsx` / `*-graph.tsx` — Client Component (`"use client"`)，负责交互
- `actions.ts` — Server Actions (`"use server"`)，处理所有 CRUD 操作

```tsx
// page.tsx 标准模式
export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Skeleton />}>
      <DataLoader searchParams={searchParams} />
    </Suspense>
  );
}
```

### Server Actions 返回格式

```typescript
// 无数据操作
{ success: boolean; error: string | null }
// 带数据查询
{ data: T[]; count: number; error: string | null }
```

### 数据变更后缓存刷新

所有在 `app/family-tree/actions.ts` 中的数据变更（创建、更新、删除、批量导入）必须调用：
```typescript
revalidatePath("/family-tree", "layout");
```
使用 `"layout"` 类型以失效整个路由段缓存，确保列表、2D图、3D图、时间轴等所有视图数据同步。

### 批量查询关联数据（避免 JOIN）

```typescript
const fatherIds = data.map(item => item.father_id).filter(Boolean);
const { data: fathers } = await supabase
  .from("family_members")
  .select("id, name")
  .in("id", fatherIds);
const fatherMap = Object.fromEntries(fathers.map(f => [f.id, f.name]));
```

## 路由与认证

- Middleware: `proxy.ts` 拦截所有非静态资源请求
- 公开路由: `/`, `/noauth/*`, `/auth/*`, `/login/*`
- 受保护路由: 其他所有路径 → 未登录自动跳转 `/auth/login`
- `/` 自动重定向到 `/family-tree/graph`

## 数据库 Schema

### family_members 表

```
id (bigint, PK, GENERATED ALWAYS AS IDENTITY)
name (text, NOT NULL)
generation (integer)          — 世代数
sibling_order (integer)        — 兄弟姐妹排序
father_id (bigint, FK→family_members.id) — 自引用，构建树形结构
gender (text, CHECK: '男' | '女')
official_position (text)      — 官职
is_alive (boolean, DEFAULT true)
spouse (text)                 — 配偶姓名
remarks (text)                — Slate.js 富文本 JSON
birthday (date)
death_date (date)
residence_place (text)
updated_at (timestamptz, DEFAULT now())
```

完整 SQL 见 `.github/family_members.sql`。

## 环境变量

`.env.local` 必需（参考 `.env.example`）：
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_FAMILY_SURNAME="刘"    # 家族姓氏，默认"刘"
```

## React Flow 可视化约定

参考 `app/family-tree/graph/`：
- 自定义节点定义在 `family-node.tsx`，使用 `memo()` 优化渲染
- 节点数据类型需包含 `[key: string]: unknown` 索引签名
- CSS 文件导入使用 `// @ts-expect-error` 注释抑制类型错误
- 主题色使用 CSS 变量 `hsl(var(--foreground))` 等适配明暗模式
- 世代标尺：`generation-node.tsx` 渲染左侧水墨风格世代轴
- 连线使用自定义 `flowing-edge.tsx`
- 颜色工具函数在 `graph/utils/colors.ts`，代际数字转换在 `graph/utils/chinese-num.ts`

## UI 规范

- className 合并使用 `cn()` (来自 `@/lib/utils`)
- 弹窗使用 shadcn Dialog 组件，移动端点击遮罩不关闭以防数据丢失
- 图标统一使用 lucide-react
- 表格使用 shadcn Table + 手动分页
- 移动端使用 `MobileNav` 组件（`components/mobile-nav.tsx`）

## 关键组件位置

| 组件 | 路径 |
|------|------|
| 认证按钮 | `components/auth-button.tsx` |
| 移动端导航 | `components/mobile-nav.tsx` |
| 登录表单 | `components/login-form.tsx` |
| 富文本编辑器 | `components/rich-text/editor.tsx` |
| 富文本查看器 | `components/rich-text/viewer.tsx` |
| 成员详情弹窗 (Living Book) | `app/family-tree/member-detail-dialog.tsx` |
| 批量导入弹窗 | `app/family-tree/import-members-dialog.tsx` |
| 父亲选择下拉框 | `app/family-tree/father-combobox.tsx` |
