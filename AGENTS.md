# Cottie - ClassIn用户公共导航平台

## 项目概述

Cottie是一个面向ClassIn用户的公共导航平台，基于Vue 3、TypeScript和Vite构建的单页应用(SPA)。该项目为ClassIn用户提供了一个综合性的资源导航中心，包含网页跳转、音乐播放、群聊链接等功能。

项目特点：
- 采用Vue 3的`<script setup>`语法糖
- 使用Vue Router进行路由管理
- 支持深色/浅色主题切换
- 集成音乐播放器功能
- 响应式设计，适配移动端
- 使用CSS变量进行主题管理

## 技术栈

- **前端框架**: Vue 3 (使用Composition API)
- **语言**: TypeScript
- **构建工具**: Vite
- **路由**: Vue Router 4
- **样式**: CSS (使用CSS变量和现代CSS特性)
- **UI特性**: 毛玻璃效果、动画过渡、响应式布局

## 目录结构

```
src/
├── App.vue              # 根组件
├── main.ts              # 应用入口
├── assets/              # 静态资源
├── components/          # 可复用组件
│   ├── AnnouncementCard.vue # 公告卡片组件
│   ├── Card.vue         # 通用卡片组件
│   ├── Footer.vue       # 页脚组件
│   ├── MusicPlayer.vue  # 音乐播放器组件
│   └── Navbar.vue       # 导航栏组件
├── composables/         # 组合式函数
│   ├── useMusicPlayer.ts # 音乐播放器逻辑
│   └── useTheme.ts      # 主题管理逻辑
├── config/              # 配置文件
│   └── index.ts         # 应用配置
├── data/                # 静态数据
│   ├── groups.json      # 群组数据
│   ├── music-index.json # 音乐索引数据
│   └── weblinks.json    # 网页链接数据
├── router/              # 路由配置
│   └── index.ts         # 路由定义
├── styles/              # 全局样式
│   └── main.css         # 主样式文件
└── views/               # 页面组件
    ├── About.vue        # 关于页面
    ├── Center.vue       # 资源中心页面
    ├── ClassIn.vue      # ClassIn群聊页面
    ├── Home.vue         # 首页
    ├── Terms.vue        # 服务协议页面
    └── WebLinks.vue     # 网页跳转页面
```

## 页面路由

- `/` - 首页
- `/about` - 关于
- `/center` - 资源分类中心
- `/classin` - ClassIn群聊
- `/weblinks` - 网页跳转
- `/terms` - 服务协议

## 主要功能

### 主题切换
使用`useTheme`组合式函数实现深色/浅色主题切换，主题偏好会保存在localStorage中。

### 音乐播放器
使用`useMusicPlayer`组合式函数实现音乐播放功能，支持：
- 播放/暂停
- 上一首/下一首
- 音量控制
- 歌词显示
- 播放进度控制

### 响应式导航
包含桌面端和移动端两种导航模式，使用汉堡菜单适配小屏幕设备。

## API配置

项目通过环境变量配置API端点：
- `VITE_API_BASE_URL`: API基础URL，默认为 'https://api.xn--bgtt50a8xt.cn/'
- `VITE_CONTACT_EMAIL`: 联系邮箱，默认为 'luoqing5203789@outlook.com'

## 构建和运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
这将在 `http://localhost:5173` 启动开发服务器。

### 构建生产版本
```bash
npm run build
```
这将构建生产版本并输出到 `dist/` 目录。

### 预览构建结果
```bash
npm run preview
```
这将在本地预览构建后的应用。

## 开发约定

- 使用TypeScript进行类型检查
- 遵循Vue 3的Composition API模式
- 使用CSS变量进行主题管理
- 通过组合式函数(composables)提取可复用逻辑
- 路由使用懒加载以优化性能
- 组件使用单文件组件(SFC)格式

## 环境变量

项目使用以下环境变量：
- `VITE_API_BASE_URL`: API基础URL
- `VITE_CONTACT_EMAIL`: 联系邮箱
- `VITE_RAINYUN_URL`: 雨云链接
- `VITE_DEEPSEEK_URL`: DeepSeek链接

## 特殊功能

### 代理配置
Vite配置中设置了API代理，将`/api`请求代理到`https://api.xn--bgtt50a8xt.cn`。

### 滚动行为
路由配置中设置了滚动行为，确保页面切换后滚动到顶部。

### 页面标题管理
路由守卫中实现了动态页面标题更新功能。