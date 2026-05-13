# pure-genealogy 族谱管理系统

<p align="center">
  <video src="docs/demo.mp4" controls width="800" poster="app/demo.gif"></video>
</p>

<p align="center">
  一个基于 Next.js 15 和 SQLite 构建的现代化、全中文家族族谱管理系统。
</p>

## 项目亮点

- **前沿技术栈**: 采用最新的 **Next.js 15** (App Router) 和 **React 19**。
- **自包含架构**: 使用 **SQLite** (sql.js) 作为数据库，零依赖部署，数据文件即数据库。
- **深度中文化**: 针对中文语境深度定制，包括 UI 文案、日期格式、元数据及字辈统计。
- **多维可视化**:
  - **2D 族谱图**: 基于 Dagre 算法的层级树状图。支持**世代标尺**指引、**松柏绿瀑布式**代际渐变色、**配偶直显**。提供"金线溯源"与"金扇繁衍"的双向高亮交互，支持高清大图导出。
  - **3D 关系网**: 沉浸式三维力导向图，支持**自动巡游 (Auto Tour)** 功能，可自动规划路径并在家族成员间漫游。
  - **家族统计**: 多维度数据仪表盘，包含世代增长趋势、字辈统计等。
  - **历史时间轴**: 直观展示家族成员的生卒年时间分布。
- **成员管理**:
  - 支持多配偶记录，记录配偶时段（起始/结束日期及原因）
  - 母亲支持关联已有女性成员或手写姓名
  - **族谱起点**: 指定唯一 root 成员，图谱自动从起点展开
  - Excel 批量导入导出
- **富文本生平**: 集成 Slate.js 编辑器，支持排版精美的生平传记。

## 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **数据库**: [SQLite](https://www.sqlite.org/) + [sql.js](https://github.com/sql-js/sql.js/)（纯 JS/WASM 实现，无需原生编译）
- **认证**: 基于用户名的 JWT 认证 (jose + bcryptjs)
- **UI 组件库**: [shadcn/ui](https://ui.shadcn.com/) (基于 Radix UI)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **可视化**: 
  - [@xyflow/react](https://reactflow.dev/) (2D 图谱)
  - [react-force-graph-3d](https://github.com/vasturiano/react-force-graph-3d) (3D 图谱)
  - [recharts](https://recharts.org/) (统计图表)
- **富文本**: [Slate.js](https://docs.slatejs.org/) (生平事迹编辑)
- **工具**: TypeScript, ESLint, Lucide React (图标), html-to-image (图片导出)

## 主要功能

### 1. 核心管理 (`/family-tree`)
- **成员档案**: 记录姓名、世代、排行、父母、多配偶、生卒年、居住地、官职等详细信息。
- **族谱起点**: 支持指定唯一 root 成员，图谱自动以此为中心展开。
- **多配偶管理**: 每位成员可记录多位配偶，含起止日期及结束原因。
- **富文本生平**: 支持加粗、斜体等格式的生平事迹记录。
- **批量操作**: 支持 Excel/CSV 数据的批量导入导出。

### 2. 可视化视图
- **2D 族谱图 (`/family-tree/graph`)**: 
  - **自动布局**: 基于 Dagre 算法的层级树状图，从 root 成员 BFS 展开。
  - **视觉增强**: 左侧自动生成水墨风"世代标尺"，节点根据代数深浅渐变。
  - **交互体验**: 点击节点触发"金线溯源"和"金扇繁衍"双向高亮。
  - **非主树灰显**: 不在 root 后代树内的成员灰显置底。
  - **图片导出**: 一键导出带背景和水印的高清 JPEG。
- **3D 力导向图 (`/family-tree/graph-3d`)**: 
  - **星空漫游**: 炫酷的 3D 节点展示。
  - **自动巡游**: 自动计算最短关系路径并控制相机飞行浏览。
- **统计仪表盘 (`/family-tree/statistics`)**: 人口概览、性别/在世比例、世代增长趋势、年龄分布、字辈统计。
- **时间轴 (`/family-tree/timeline`)**: 横向时间轴展示家族历史。

### 3. 系统功能
- **安全认证**: 用户名 + 密码登录 (JWT + bcrypt)。
- **响应式设计**: 适配桌面端与移动端，支持明暗主题切换。
- **自动迁移**: 启动时自动检测并更新数据库表结构。

## 快速开始

### 方式一：Docker Compose（推荐）

```bash
git clone https://github.com/mintonzhang/pure-genealogy.git
cd pure-genealogy

# 复制环境变量模板
cp .env.docker .env
# 编辑 .env，至少设置 JWT_SECRET（生成方式: openssl rand -base64 32）

# 构建并启动
docker compose up -d --build
```

默认管理员账号：`admin` / `admin`。访问 [http://localhost:3000](http://localhost:3000)。

### 方式二：本地开发

```bash
git clone https://github.com/mintonzhang/pure-genealogy.git
cd pure-genealogy
npm install

# 复制环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev
```

数据库文件 (`data/family.db`) 和表结构会在首次启动时自动创建。访问 [http://localhost:3000](http://localhost:3000) 开始使用。

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `FAMILY_SURNAME` | 家族姓氏（页面标题和水印） | 张 |
| `JWT_SECRET` | JWT 密钥（生产环境务必修改） | - |
| `ADMIN_USERNAME` | 管理员用户名（Docker 自动创建） | admin |
| `ADMIN_PASSWORD` | 管理员密码（Docker 自动创建） | admin |
| `DB_PATH` | 数据库文件路径 | data/family.db |

### 明朝皇族 Demo 数据库

项目中附带了一份明朝皇族 demo 数据库 `data/ming-demo.db`，包含从明太祖朱元璋到崇祯帝的完整皇帝世系及各大藩王后代，共 **140 位家族成员**。

本地开发使用方式：

```bash
# 复制 demo 数据库替换默认数据库
cp data/ming-demo.db data/family.db

# 然后正常启动
npm run dev
```

登录后即可浏览明朝 16 帝及南明 3 帝的完整族谱，体验 2D/3D 图谱、统计面板、时间轴等功能。

如需重新生成：

```bash
npx tsx scripts/build-ming-demo.ts
```

## 项目结构

```
/
├── app/                    # Next.js App Router 核心目录
│   ├── auth/               # 认证流程
│   ├── family-tree/        # 族谱主要功能区
│   │   ├── graph/          # 2D 图谱 (React Flow + Dagre)
│   │   ├── graph-3d/       # 3D 力导向图
│   │   ├── statistics/     # 统计仪表盘
│   │   ├── timeline/       # 时间轴
│   │   ├── biography-book/ # 传记书模式
│   │   └── page.tsx        # 成员列表
│   └── api/                # API 路由
├── components/             # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   └── rich-text/          # Slate 富文本编辑器
├── lib/                    # 工具函数
│   ├── db.ts               # SQLite 数据库初始化和迁移
│   ├── auth.ts             # JWT 认证
│   └── utils.ts            # 通用工具
├── data/                   # SQLite 数据文件
├── scripts/                # 辅助脚本
│   └── init-admin.js       # 管理员自动创建
├── Dockerfile              # 多阶段 Docker 构建
├── docker-compose.yml      # Docker Compose 编排
└── docker-entrypoint.sh    # 容器入口脚本
```

## 许可证

本项目采用 [MIT](LICENSE) 许可证。
