# 知识创作者工作台

AI 驱动的知识博主任务推送与脚本生成系统

## 项目简介

知识创作者工作台是一款专为知识博主打造的内容创作辅助工具，帮助专业人士将复杂知识转化为通俗易懂的口播内容。

### 核心功能

- **每日任务推送** - 根据用户领域偏好，每日推送精选创作选题
- **AI 脚本生成** - 使用 Kimi AI 生成符合口播风格的脚本内容
- **多模板支持** - 支持教程、故事、评测、观点等多种内容模板
- **创作数据分析** - 统计创作频率、完成率、连续打卡天数等
- **互动埋点设计** - 自动在脚本中插入互动点，提升观众参与度

## 技术栈

- **框架** - [Next.js 14](https://nextjs.org/) (App Router)
- **语言** - [TypeScript](https://www.typescriptlang.org/)
- **样式** - [Tailwind CSS](https://tailwindcss.com/)
- **数据库** - [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/)
- **AI 服务** - [Kimi Code](https://platform.moonshot.cn/)
- **部署** - [Vercel](https://vercel.com/)

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写：

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/knowledge_creator"

# AI 服务
KIMI_CODE_API_KEY="your-api-key"
KIMI_CODE_BASE_URL="https://api.kimi.com/coding/v1"

# 认证
JWT_SECRET="your-jwt-secret-min-32-characters"
```

### 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/       # React 组件
│   ├── lib/              # 工具库和 API 客户端
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   └── styles/           # 全局样式
├── prisma/
│   └── schema.prisma     # 数据库模型定义
├── .github/workflows/    # GitHub Actions CI/CD
└── vercel.json           # Vercel 部署配置
```

## 部署

项目已配置自动部署到 Vercel：

1. 推送代码到 `main` 分支触发自动部署
2. 在 Vercel Dashboard 配置环境变量
3. 配置 `DATABASE_URL` 指向 PostgreSQL 数据库

## 许可证

MIT License
