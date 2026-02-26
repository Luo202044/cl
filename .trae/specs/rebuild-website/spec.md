# Cottie 网站重构 Spec

## Why

旧网站使用纯HTML/CSS/JS构建，代码分散且难以维护。需要将其重构为Vue3单页应用，使用animations.css的科技风格样式系统，实现所有原有功能并提升用户体验。

## What Changes

- 将纯HTML网站重构为Vue3 + TypeScript单页应用
- 使用animations.css样式系统替换原有粉色主题,但是要保留粉色 并且不能有违和感
- 实现路由导航系统
- 实现音乐播放器组件
- 实现响应式布局和主题切换功能

## Impact

- Affected specs: 整个网站架构
- Affected code: src目录下所有文件

## ADDED Requirements

### Requirement: 页面路由系统

系统应提供SPA路由导航功能。

#### Scenario: 页面导航

- **WHEN** 用户点击导航链接
- **THEN** 页面内容切换而不刷新浏览器

### Requirement: 首页

系统应提供首页展示功能。

#### Scenario: 首页展示

- **WHEN** 用户访问首页
- **THEN** 显示欢迎区域、功能跳转卡片、公告列表、友链区域

### Requirement: 关于页面

系统应提供关于页面展示开发者信息。

#### Scenario: 关于页面展示

- **WHEN** 用户访问关于页面
- **THEN** 显示开发者头像、名称、简介等信息

### Requirement: 资源分类中心

系统应提供资源分类导航功能。

#### Scenario: 分类导航

- **WHEN** 用户访问资源分类中心
- **THEN** 显示ClassIn群聊、网页跳转等分类卡片

### Requirement: ClassIn群聊列表

系统应提供ClassIn群聊跳转功能。

#### Scenario: 群聊跳转

- **WHEN** 用户点击群聊卡片
- **THEN** 跳转到对应的ClassIn群聊

### Requirement: 网页跳转列表

系统应提供收录网站跳转功能。

#### Scenario: 网站跳转

- **WHEN** 用户点击网站卡片
- **THEN** 在新标签页打开目标网站

### Requirement: 服务协议页面

系统应提供服务协议内容展示。

#### Scenario: 协议展示

- **WHEN** 用户访问服务协议页面
- **THEN** 显示完整的服务协议条款

### Requirement: 音乐播放器组件

系统应提供可折叠的音乐播放器。

#### Scenario: 播放器展开/收起

- **WHEN** 用户点击播放器手柄
- **THEN** 播放器面板展开或收起

#### Scenario: 音乐播放控制

- **WHEN** 用户点击播放/暂停按钮
- **THEN** 音乐开始或暂停播放

#### Scenario: 切换歌曲

- **WHEN** 用户点击上一首/下一首按钮
- **THEN** 切换到对应歌曲

#### Scenario: 进度控制

- **WHEN** 用户点击进度条
- **THEN** 音乐跳转到对应位置

### Requirement: 导航栏组件

系统应提供顶部导航栏。

#### Scenario: 导航栏展示

- **WHEN** 用户访问任意页面
- **THEN** 显示Logo和导航链接

#### Scenario: 导航高亮

- **WHEN** 用户在某个页面
- **THEN** 对应的导航链接高亮显示

### Requirement: 主题切换

系统应支持亮色/暗色主题切换。

#### Scenario: 主题切换

- **WHEN** 用户点击主题切换按钮
- **THEN** 页面主题在亮色和暗色之间切换

### Requirement: 响应式设计

系统应适配不同屏幕尺寸。

#### Scenario: 移动端适配

- **WHEN** 用户使用移动设备访问
- **THEN** 页面布局自动适配移动端

## MODIFIED Requirements

无（全新重构）

## REMOVED Requirements

无
