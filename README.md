<p align="center">
  <img src="public/images/icon.png" width="120" alt="看山情绪树洞" />
</p>

<h1 align="center">🦊 看山情绪树洞</h1>
<p align="center">「看山在听」—— AI 驱动的匿名情绪空间</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Three.js-R3F-black?logo=three.js" />
  <img src="https://img.shields.io/badge/DeepSeek-AI-0066FF" />
</p>

<p align="center">
  🏆 <b>Zhihu AI Hackathon 参赛作品</b> · 
  <a href="#-快速开始">快速开始</a> · 
  <a href="#-功能特性">功能特性</a> · 
  <a href="#-技术架构">技术架构</a>
</p>

---

## 📖 项目简介

**看山情绪树洞**是一个 AI 驱动的匿名情绪倾诉空间。用户可以用自然语言表达任何情绪，知乎吉祥物「看山」会通过 DeepSeek 大模型提供温暖的回应，并自动生成治愈故事、情绪分析、热点话题等个性化内容卡片。

核心理念：**每个人都值得被倾听，每种情绪都值得被看见。**

## ✨ 功能特性

### 🎭 情绪交互系统
- **智能情绪识别**：6 种情绪状态（开心 / 好奇 / 悲伤 / 兴奋 / 困惑 / 平静）
- **DeepSeek AI 对话**：真实大模型驱动的温暖回应，看山人设贯穿全程
- **情绪触发内容**：对话自动生成故事卡片、心理分析、热点推荐

### 🌐 知乎生态集成
- **OAuth2 登录**：知乎账号授权，获取用户信息
- **圈子 API**：HMAC-SHA256 签名认证，浏览和发布圈子内容
- **热榜数据**：实时知乎热榜展示，分类筛选

### 🦊 3D 看山模型
- **Three.js + R3F**：GLB 模型渲染，表情动画系统
- **粒子特效**：情绪驱动的粒子颜色和数量变化
- **光环动画**：呼吸灯效果，情绪响应式光效

### 📱 多页面体验
| 页面 | 功能 |
|------|------|
| 🌙 树洞 | AI 对话 + 内容卡片流 |
| 🔥 热榜 | 知乎热搜展示，分类筛选 |
| 🔍 探索 | 关键词搜索，快速建议 |
| 💍 圈子 | 黑客松脑洞社区，发帖互动 |
| ⭐ 收藏 | 精选故事 + 情感文章 |
| 👤 我的 | OAuth 登录，API 状态，设置 |

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/funny8kids/Tree-hole.git
cd Tree-hole
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：

```env
# DeepSeek AI（必需 - 用于 AI 对话）
VITE_DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx

# 知乎开放平台（可选 - 用于圈子和 OAuth）
VITE_ZHIHU_APP_ID=your_app_id
VITE_ZHIHU_APP_SECRET=your_app_secret
```

> 💡 **没有 API Key？** 应用内置 Mock 数据降级系统，无 Key 也能完整体验所有功能。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 即可体验。

### 5. 构建生产版本

```bash
npm run build
npm run preview
```

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                     前端层                           │
│  React 18 + Vite 5 + Tailwind CSS 3                 │
│  Three.js (R3F/Drei) + Framer Motion + Zustand       │
├─────────────────────────────────────────────────────┤
│                    服务层                             │
│  DeepSeek API ──────┐                                │
│  知乎 OAuth2 ───────┼── 降级策略 ── Mock 数据系统    │
│  知乎圈子 API (HMAC)┘    (3 层 fallback)             │
├─────────────────────────────────────────────────────┤
│                    3D 渲染层                         │
│  GLB 模型 + 粒子系统 + 情绪驱动动画                   │
└─────────────────────────────────────────────────────┘
```

### 核心技术栈

| 技术 | 用途 |
|------|------|
| **React 18** | UI 框架，函数式组件 + Hooks |
| **Vite 5** | 构建工具，HMR 热更新 |
| **Tailwind CSS 3** | 样式系统，玻璃态设计 |
| **Three.js / R3F** | 3D 看山模型渲染 |
| **Framer Motion** | 页面/组件动画 |
| **Zustand** | 全局状态管理 |
| **DeepSeek API** | AI 对话引擎 |
| **Crypto-JS** | HMAC-SHA256 签名 |

### 降级策略

```
真实 API 请求
  ├─ 成功 → 使用真实数据
  └─ 失败 → Mock 数据（27KB 高质量中文内容）
                └─ 无数据 → 兜底空状态 UI
```

## 📂 项目结构

```
src/
├── components/
│   ├── cards/          # 内容卡片组件
│   ├── kanshan/        # 3D 看山模型 + 粒子系统
│   ├── layout/         # 侧边栏布局
│   ├── pages/          # 6 个功能页面
│   └── ui/             # 通用 UI 组件
├── hooks/              # 自定义 Hooks（核心业务流）
├── services/           # API 服务 + Mock 数据
├── stores/             # Zustand 状态管理
└── App.jsx             # 主入口 + 路由
```

## 🎨 设计亮点

- **玻璃态 UI**：`backdrop-blur` + 半透明渐变，深色主题
- **情绪色彩系统**：每种情绪对应独特的渐变色板
- **丝滑动画**：framer-motion 驱动的入场、悬停、退出效果
- **3D 粒子特效**：情绪驱动的粒子颜色和数量变化
- **响应式布局**：侧边栏可折叠，适配不同屏幕

## 🙏 致谢

- [知乎](https://www.zhihu.com) — 开放平台 API
- [DeepSeek](https://www.deepseek.com) — AI 对话能力
- [刘看山](https://www.zhihu.com/liukanshan) — 知乎官方吉祥物
- [Three.js](https://threejs.org) — 3D 渲染引擎

## 📄 License

MIT License

---

<p align="center">
  Made with 🦊 by <b>funny8kids</b> · Zhihu AI Hackathon 2026
</p>
