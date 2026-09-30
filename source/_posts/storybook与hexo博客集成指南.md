---
title: Storybook 与 Hexo 博客集成指南
layout: post
date: 2026-08-30
categories:
  - 前端开发
tags:
  - React
  - 组件库
---

# 📖 Storybook 与 Hexo 博客集成指南

## 🎯 方案概述

将 `react-radial-menu-master` 组件库的 **Storybook 交互式文档**无缝集成到 Hexo 博客系统中，通过 iframe 嵌入方式展示。

## ✅ 已完成的配置

### 1. Hexo 配置 (_config.yml)

已在 [`_config.yml`](file:///e:/nodeSpace/blog/_config.yml#L30-L31) 中添加：

```yaml
skip_render:
  - storybook/**/*
```

**作用**: 告诉 Hexo 跳过 `source/storybook/` 目录下所有文件的 Nunjucks 模板解析，直接复制原文件。

### 2. 博客文章

已有完整的文档页面: [react-rainbow-menu.md](file:///e:/nodeSpace/blog/source/_posts/react-rainbow-menu.md)

- 包含 iframe 嵌入代码
- 完整的 API 文档
- 使用示例和 FAQ

---

## 🚀 使用方法

### 方法一：一键部署脚本（推荐）

双击运行 [`deploy-storybook.bat`](file:///e:/nodeSpace/blog/deploy-storybook.bat)：

```bash
# 在 blog 目录下双击
deploy-storybook.bat
```

脚本会自动完成：

1. ✅ 进入 `react-radial-menu-master` 目录
2. ✅ 安装依赖（如需要）
3. ✅ 构建 Storybook
4. ✅ 复制到 `blog/source/storybook/`
5. ✅ 清理旧版本

### 方法二：手动操作

#### Step 1: 构建 Storybook

```bash
cd react-radial-menu-master
npm install          # 首次运行需要安装依赖
npm run build-storybook
```

构建产物默认输出到 `storybook-static/` 目录。

#### Step 2: 复制到博客目录

```bash
# 删除旧版本（如果存在）
rmdir /s /q ..\blog\source\storybook

# 复制新版本
xcopy /E /I /Y storybook-static ..\blog\source\storybook
```

#### Step 3: 启动博客预览

```bash
cd ../blog
hexo server
```

访问：

- 📚 文章页: <http://localhost:4000/2026/07/09/react-rainbow-menu/>
- 🎮 Storybook: <http://localhost:4000/storybook/>

---

## 🔧 技术细节

### 为什么需要 skip_render？

**问题原因**:

- Hexo 使用 [Nunjucks](https://mozilla.github.io/nunjucks/) 模板引擎
- Nunjucks 使用 `{{ variable }}` 语法
- JavaScript 文件中的对象字面量 `{ key: value }` 会触发解析错误

**解决方案**:

```yaml
skip_render:
  - storybook/**/*   # 跳过 storybook 目录下所有文件
```

这样 Hexo 会：

- ✅ 直接复制 JS/CSS/HTML 文件到 `public/` 目录
- ❌ 不进行模板语法解析
- ✅ 保持原始代码完整性

### 目录结构

```
e:\nodeSpace\
├── blog/                          # Hexo 博客
│   ├── source/
│   │   ├── _posts/
│   │   │   └── react-rainbow-menu.md  # 📄 组件库文档
│   │   └── storybook/             # 🎮 Storybook 构建产物（自动生成）
│   │       ├── index.html
│   │       ├── iframe.html
│   │       ├── stories-BasicControls-stories.xxx.iframe.bundle.js
│   │       └── ...
│   ├── _config.yml                # ⚙️ 已配置 skip_render
│   └── deploy-storybook.bat       # 🚀 一键部署脚本
│
└── react-radial-menu-master/      # React 组件库源码
    ├── src/
    ├── .storybook/
    ├── storybook-static/          # 构建输出（临时）
    └── package.json
```

---

## 📝 更新流程

当组件库代码更新后：

```bash
# 1. 运行部署脚本
cd blog
deploy-storybook.bat

# 2. 本地测试
hexo server
# 访问 http://localhost:4000/storyboard/ 验证

# 3. 部署上线
hexo generate
hexo deploy
```

---

## 🎨 自定义配置

### 修改 Storybook 输出路径

如果需要修改 Storybook 的构建输出路径，编辑 [`react-radial-menu-master/.storybook/main.ts`](file:///e:/nodeSpace/react-radial-menu-master/.storybook/main.ts)：

```typescript
module.exports = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  // 修改输出目录（可选）
  outputDir: 'storybook-static',  // 默认值
};
```

### 调整 iframe 大小

编辑 [react-rainbow-menu.md](file:///e:/nodeSpace/blog/source/_posts/react-rainbow-menu.md) 中的 iframe：

```html
<iframe
  src="/storybook/"
  width="100%"
  height="800px"           <!-- 调整高度 -->
  frameborder="0"
  style="border: 2px solid #667eea; border-radius: 12px; ..."
  loading="lazy">
</iframe>
```

---

## ⚠️ 注意事项

### 1. 不要手动编辑 source/storybook/

该目录是**自动生成**的，每次运行部署脚本都会被覆盖。如需修改：

- 修改组件库源码 (`react-radial-menu-master/src/`)
- 修改 Storybook 配置 (`.storybook/`)
- 重新运行部署脚本

### 2. Git 忽略规则

建议在 `.gitignore` 中添加：

```gitignore
# blog/.gitignore
source/storybook/
public/storybook/
db.json
.deploy_git/
```

避免将构建产物提交到仓库。

### 3. 性能优化

- ✅ `loading="lazy"` - iframe 懒加载
- ✅ 按需加载 - 只在特定文章页嵌入
- ✅ CDN 加速 - 可考虑将 Storybook 部署到单独的 CDN

---

## 🐛 故障排除

### 问题 1: 404 Not Found

**症状**: 访问 `/storybook/` 返回 404

**解决方案**:

```bash
# 确认文件存在
dir source\storybook\index.html

# 清理缓存并重新生成
hexo clean
hexo server
```

### 问题 2: Nunjucks 错误仍然存在

**症状**: 启动时报 `expected variable end` 错误

**解决方案**:

1. 检查 `_config.yml` 中 `skip_render` 配置
2. 确保缩进正确（使用空格，不用 Tab）
3. 重启服务器：`hexo server --debug`

### 问题 3: 样式丢失

**症状**: Storybook 页面样式混乱

**原因**: 相对路径问题

**解决方案**:
确认 Storybook 的 `base` 配置：

```typescript
// .storybook/main.ts
module.exports = {
  // ...
  base: '/storybook/',  // 重要！
};
```

---

## 🌟 高级方案（可选）

### 方案 A: 子域名部署

将 Storybook 部署到独立子域名：

1. 构建 Storybook：`npm run build-storybook`
2. 部署到 `storybook.yourdomain.com`
3. 修改博客中的 iframe src：`src="https://storybook.yourdomain.com"`

**优点**:

- 完全隔离，不影响博客性能
- 可独立缓存策略
- 支持 HTTPS 单独配置

### 方案 B: GitHub Pages 分支

使用 GitHub Pages 的独立分支：

```bash
# 创建 gh-pages 分支
git subtree push --prefix storybook-static origin gh-pages
```

启用 GitHub Pages 后访问：`https://username.github.io/repo-name/`

---

## 📊 成果展示

集成完成后，你的博客将拥有：

✅ **完整的交互式文档** - 用户可直接在博客中试用组件
✅ **实时代码演示** - 无需切换到其他平台
✅ **统一的用户体验** - 文档、示例、API 一站式访问
✅ **自动化部署** - 一键更新，无需手动复制

---

## 💡 最佳实践

1. **版本同步**: 组件库发版时同时更新博客文档
2. **性能监控**: 定期检查 iframe 加载速度
3. **用户反馈**: 在文章中添加反馈入口
4. **SEO 优化**: 为 iframe 提供 alt 文本和描述

---

*最后更新: 2026-09-30 | 维护者: xiaorunbao*
