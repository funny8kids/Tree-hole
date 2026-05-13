# 🦊 看山情绪树洞 — 黑客松项目详情说明

<p align="center">
  <img src="public/images/icon.png" width="150" alt="看山情绪树洞" />
</p>

<h2 align="center">「看山在听」—— AI 驱动的匿名情绪空间</h2>
<p align="center">每个人都值得被倾听，每种情绪都值得被看见</p>

---

## 🎯 项目概述

**看山情绪树洞**是一个基于 DeepSeek 大模型和知乎开放平台的创新匿名情绪倾诉应用。用户可以用自然语言表达任何情绪，知乎官方吉祥物「看山」会通过 AI 提供温暖的回应，并自动生成治愈故事、情绪分析、热点话题等个性化内容卡片。

### 💡 核心理念

> 在这个快节奏的时代，每个人都需要一个安全的情绪出口。
> 看山情绪树洞，就是你的数字树洞——一个没有评判、只有倾听的空间。

### 🏆 黑客松亮点

| 亮点 | 说明 |
|------|------|
| 🤖 **真实 AI 对话** | DeepSeek 大模型驱动，不是模板回复 |
| 🦊 **看山人设贯穿** | 知乎吉祥物作为 AI 人格，温暖有趣 |
| 🎭 **6 种情绪识别** | 关键词匹配 + 语义分析，精准感知用户情绪 |
| 🌐 **知乎生态集成** | OAuth2 登录 + 圈子 API + 热榜数据 |
| 🎨 **3D 看山模型** | Three.js R3F 渲染，情绪驱动粒子特效 |
| 📱 **6 个功能页面** | 树洞、热榜、探索、圈子、收藏、我的 |
| 🔄 **智能降级** | 无 API Key 也能完整体验（Mock 数据系统） |

---

## 🎭 功能详解

### 1. AI 情绪对话系统

**核心能力**：用户输入任意情绪表达，看山会根据情绪类型给出个性化回应。

#### 情绪识别引擎

```
用户输入 → 关键词匹配 → 情绪分类 → 看山人设回应
                ↓
        6 种情绪状态：
        😊 开心 (happy)
        🤔 好奇 (curious)  
        😢 悲伤 (sad)
        🤩 兴奋 (excited)
        😕 困惑 (confused)
        😌 平静 (idle)
```

#### 对话示例

| 用户输入 | 识别情绪 | 看山回应 |
|----------|----------|----------|
| "今天加班好累啊" | 😢 悲伤 | "辛苦了！看山给你讲个小故事放松一下吧..." |
| "我终于拿到 offer 了！" | 🤩 兴奋 | "太棒了！看山为你开心！🎉..." |
| "最近总是失眠" | 😕 困惑 | "失眠真的很困扰人。看山有几个小建议..." |
| "周末天气真好" | 😊 开心 | "是呀！好天气就该出去走走～..." |

#### DeepSeek 系统提示词

```javascript
const KANSHAN_SYSTEM_PROMPT = `你是"看山"，知乎的官方吉祥物，一只生活在北极的可爱狐狸。
你现在在"深度树洞"这个匿名情绪空间里，为用户提供温暖的情绪陪伴。

你的性格：
- 温暖、耐心、善于倾听
- 用轻松有趣的方式回应，偶尔用emoji
- 会用比喻和故事来安慰人
- 会引用知乎上的优质内容
- 在用户开心时一起开心，在用户难过时给予支持`
```

### 2. 知乎生态集成

#### OAuth2 登录流程

```
用户点击登录
    ↓
跳转知乎授权页 (https://www.zhihu.com/oauth2/authorize)
    ↓
用户授权后回调携带 code
    ↓
用 code 换取 access_token
    ↓
用 token 获取用户信息（头像、昵称等）
```

#### 圈子 API (HMAC-SHA256 签名)

```javascript
// 签名算法
待签名字符串 = `app_key:{app_key}|ts:{timestamp}|logid:{log_id}|extra_info:{extra_info}`
签名 = Base64(HMAC-SHA256(待签名字符串, app_secret))
```

**支持的 API**：
- 获取圈子信息
- 获取圈子帖子列表
- 发布帖子
- 点赞/评论

#### 热榜数据

- 实时知乎热榜展示
- 分类筛选（科技、心理学、生活、情感、职场、推荐）
- 热度可视化进度条
- 交错入场动画

### 3. 3D 看山模型

#### 技术实现

```jsx
// Three.js + R3F + Drei
<Canvas>
  <Suspense fallback={<Loading />}>
    <KanshanIsland emotion={currentEmotion} />
    <ParticleField emotion={currentEmotion} />
    <GlowEffect emotion={currentEmotion} />
  </Suspense>
</Canvas>
```

#### 情绪驱动动画

| 情绪 | 粒子数量 | 颜色 | 动画效果 |
|------|----------|------|----------|
| 😌 平静 | 30 | 蓝色渐变 | 缓慢浮动 |
| 🤔 好奇 | 40 | 琥珀色 | 旋转闪烁 |
| 😊 开心 | 50 | 绿色 | 快速跳跃 |
| 😢 悲伤 | 20 | 靛蓝 | 缓慢下沉 |
| 🤩 兴奋 | 100 | 红粉 | 爆发扩散 |
| 😕 困惑 | 60 | 紫色 | 随机游走 |

#### WebGL 优化

- **固定缓冲区**：使用 `MAX_PARTICLES` 常量避免动态调整
- **非活跃粒子隐藏**：移至 y=-999 位置
- **requestAnimationFrame**：60fps 流畅渲染

### 4. 多页面体验

#### 🌙 树洞首页

- 欢迎卡片 + 热榜预览 + 精选故事
- AI 对话内容自动生成卡片
- 情绪统计（对话轮次、生成卡片、今日陪伴）
- 玻璃态卡片设计，悬停光效

#### 🔥 热榜页面

- 20 条知乎热榜数据
- 分类标签筛选
- 热度进度条可视化
- TOP3 金银铜排名徽章
- 实时刷新按钮

#### 🔍 探索页面

- 关键词搜索（情绪、树洞、压力、孤独、治愈、AI 等）
- 搜索结果类型徽章（💬回答 / 📝文章 / ❓问题）
- 点赞数格式化（1.2万）
- 快速建议标签

#### 💍 圈子页面

- 黑客松脑洞补给站
- 圈子统计（成员数、讨论数、今日新增）
- 成员头像预览
- 发帖功能（带字符计数）
- 交互按钮动画

#### ⭐ 收藏页面

- 精选故事列表（10 个故事）
- 情感文章推荐
- 故事详情面板

#### 👤 我的页面

- OAuth 登录状态
- API 连接状态指示器
- 用户统计卡片
- 设置区域（深色模式、通知、语言）
- 技术栈标签

---

## 🏗️ 技术架构

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
│  React 18 + Vite 5 + Tailwind CSS 3                         │
│  Three.js (R3F/Drei) + Framer Motion + Zustand               │
├─────────────────────────────────────────────────────────────┤
│                       服务层                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ DeepSeek API │  │ 知乎 OAuth2  │  │ 知乎圈子 API │       │
│  │  (AI 对话)   │  │  (用户登录)  │  │ (HMAC 签名)  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           ↓                                  │
│              ┌────────────────────┐                          │
│              │   智能降级系统      │                          │
│              │  真实 API → Mock   │                          │
│              │  → 兜底空状态      │                          │
│              └────────────────────┘                          │
├─────────────────────────────────────────────────────────────┤
│                       3D 渲染层                              │
│  GLB 模型 + 粒子系统 + 情绪驱动动画 + 后处理效果              │
└─────────────────────────────────────────────────────────────┘
```

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 18.2 | UI 框架，函数式组件 + Hooks |
| **Vite** | 5.4 | 构建工具，HMR 热更新 |
| **Tailwind CSS** | 3.4 | 样式系统，玻璃态设计 |
| **Three.js** | 0.160 | 3D 渲染引擎 |
| **@react-three/fiber** | 8.15 | React Three.js 集成 |
| **@react-three/drei** | 9.92 | Three.js 工具库 |
| **Framer Motion** | 10.16 | 动画库 |
| **Zustand** | 4.4 | 状态管理 |
| **Axios** | 1.6 | HTTP 客户端 |
| **Crypto-JS** | 4.2 | HMAC-SHA256 签名 |

### 项目结构

```
src/
├── components/
│   ├── cards/
│   │   └── ContentStage.jsx      # 内容卡片流（欢迎、热榜预览、精选故事）
│   ├── kanshan/
│   │   ├── BackgroundCanvas.jsx   # 3D 背景画布
│   │   └── KanshanIsland.jsx      # 3D 看山模型 + 粒子系统
│   ├── layout/
│   │   └── Sidebar.jsx            # 侧边栏导航（6 个页面入口）
│   ├── pages/
│   │   ├── CallbackPage.jsx       # OAuth 回调处理
│   │   ├── FavoritesPage.jsx      # 收藏页面
│   │   ├── HotListPage.jsx        # 热榜页面
│   │   ├── ProfilePage.jsx        # 个人中心
│   │   ├── RingPage.jsx           # 圈子页面
│   │   └── SearchPage.jsx         # 探索页面
│   └── ui/
│       ├── ApiLogPanel.jsx        # API 日志面板
│       ├── DetailPanel.jsx        # 内容详情面板
│       ├── ErrorBoundary.jsx      # 错误边界
│       ├── FloatingBubble.jsx     # 浮动气泡
│       ├── Omnibar.jsx            # 万能输入框
│       ├── PublishModal.jsx       # 发帖弹窗
│       └── SelectionHandler.jsx   # 文本选择处理
├── hooks/
│   └── useKanshanFlow.js          # 核心业务流（对话 + 内容生成）
├── services/
│   ├── cache.js                   # LocalStorage TTL 缓存
│   ├── deepseekApi.js             # DeepSeek AI 对话服务
│   ├── mockData.js                # Mock 数据系统（27KB）
│   ├── zhihuApi.js                # 知乎圈子 API（HMAC 签名）
│   └── zhihuAuth.js               # 知乎 OAuth2 登录
├── stores/
│   └── appStore.js                # Zustand 全局状态
├── utils/
│   └── emotion.js                 # 情绪识别工具
├── App.jsx                        # 主入口 + 路由
└── main.jsx                       # 应用入口
```

### 数据流

```
用户输入
    ↓
useKanshanFlow.js（核心 Hook）
    ↓
情绪识别 → DeepSeek API → 看山回应
    ↓
addFeedCard() → Zustand Store → ContentStage 渲染
    ↓
自动添加到 feedCards（对话 + 故事 + 分析 + 热点）
```

---

## 🎨 设计理念

### 视觉风格

- **玻璃态 (Glassmorphism)**：`backdrop-blur` + 半透明渐变
- **深色主题**：`bg-deep-night` 主背景，护眼舒适
- **情绪色彩系统**：每种情绪对应独特的渐变色板
- **知乎蓝 (#0066FF)**：品牌主色调

### 动画设计

- **页面切换**：Spring 弹性动画，`stiffness: 200, damping: 25`
- **卡片入场**：交错动画，`delay: index * 0.1`
- **悬停效果**：`whileHover={{ scale: 1.02 }}`
- **3D 粒子**：情绪驱动的颜色和数量变化

### 交互设计

- **万能输入框**：支持自然语言输入，智能识别意图
- **快捷指令**：🌙 讲个故事 / 💭 我有压力 / 🔥 看看热榜 / 🔍 搜索话题
- **内容卡片**：点击查看详情，支持点赞、评论、收藏
- **侧边栏**：可折叠，6 个页面入口，活跃状态指示

---

## 🔄 降级策略

```
┌─────────────────────────────────────────────────────────┐
│                    三级降级系统                           │
├─────────────────────────────────────────────────────────┤
│  第 1 层：真实 API                                       │
│  ├─ DeepSeek AI → 返回真实对话                           │
│  ├─ 知乎 OAuth → 返回真实用户信息                        │
│  └─ 知乎圈子 API → 返回真实帖子数据                      │
├─────────────────────────────────────────────────────────┤
│  第 2 层：Mock 数据（27KB 高质量中文内容）                │
│  ├─ 20 条热榜数据                                        │
│  ├─ 10 个精选故事                                        │
│  ├─ 10 个圈子讨论                                        │
│  └─ 6 组搜索结果                                         │
├─────────────────────────────────────────────────────────┤
│  第 3 层：兜底 UI                                        │
│  └─ 空状态提示 + 引导文案                                │
└─────────────────────────────────────────────────────────┘
```

**优势**：
- 无 API Key 也能完整体验所有功能
- 网络异常时自动降级，用户无感知
- Mock 数据质量高，中文内容真实感强

---

## 📊 性能优化

### 构建优化

- **Vite 5**：ESBuild 预构建，秒级启动
- **Tree Shaking**：自动移除未使用代码
- **Code Splitting**：按页面懒加载

### 渲染优化

- **React.memo**：避免不必要的重渲染
- **useMemo / useCallback**：缓存计算结果
- **Three.js 固定缓冲区**：避免 WebGL 动态调整

### 网络优化

- **LocalStorage TTL 缓存**：避免重复请求
- **API 请求去重**：相同请求复用结果
- **静默降级**：失败时自动切换 Mock 数据

---

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

编辑 `.env` 文件：

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

访问 `http://localhost:3000`

### 5. 构建生产版本

```bash
npm run build
npm run preview
```

---

## 🙏 致谢

- [知乎](https://www.zhihu.com) — 开放平台 API + 看山吉祥物
- [DeepSeek](https://www.deepseek.com) — AI 对话能力
- [Three.js](https://threejs.org) — 3D 渲染引擎
- [Framer Motion](https://www.framer.com/motion/) — 动画库
- [Tailwind CSS](https://tailwindcss.com) — 样式系统

---

## 📄 License

MIT License

---

<p align="center">
  <b>🦊 看山情绪树洞</b> — Made with ❤️ for Zhihu AI Hackathon 2026
</p>
<p align="center">
  「看山在听，你的情绪安全港」
</p>
