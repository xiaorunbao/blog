# 🌍 多语言博客配置完成指南

## ✅ 已实现的功能

### 1. **多语言默认首页**

- ✅ 中文首页：`/zh-CN/` （或访问 `/` 自动跳转）
- ✅ 英文首页：`/en/`
- ✅ 首页文件位置：
  - `source/zh-CN/index.md`
  - `source/en/index.md`

### 2. **自动检测浏览器语言**

- ✅ 检测 `navigator.language` 和 `navigator.languages`
- ✅ 支持精确匹配（如 "zh-CN"）和前缀匹配（如 "en-US" → "en"）
- ✅ 记住用户的手动选择（存储在 localStorage）
- ✅ 访问根路径 `/` 时自动跳转到对应语言版本

### 3. **SEO 优化**

- ✅ 自动生成 `<link rel="alternate" hreflang="...">` 标签
- ✅ 设置 `<html lang="...">` 属性
- ✅ 添加 Open Graph 语言标签（`og:locale`, `og:locale:alternate`）
- ✅ 支持 `x-default` 标签（指向默认语言）

---

## 📁 目录结构

```
blog/
├── source/
│   ├── _posts/
│   │   ├── zh-CN/                    # 中文文章
│   │   │   ├── 文章1.md
│   │   │   ├── 文章1/ (资源文件夹)
│   │   │   └── ...
│   │   └── en/                       # 英文文章
│   │       └── hello-world.md
│   ├── zh-CN/
│   │   └── index.md                  # 中文首页
│   ├── en/
│   │   └── index.md                  # 英文首页
│   └── js/
│       ├── i18n-redirect.js          # 语言自动检测脚本
│       └── seo-i18n.js               # SEO 优化脚本
├── _config.yml                       # Hexo 主配置（已启用多语言）
└── _config.fluid.yml                 # Fluid 主题配置（已添加语言切换菜单）
```

---

## 🚀 使用方法

### 访问路径

| 页面 | URL |
| ------ | ----- |
| **中文首页** | `http://localhost:4000/zh-CN/` 或 `http://localhost:4000/` |
| **英文首页** | `http://localhost:4000/en/` |
| **中文文章示例** | `http://localhost:4000/20210319/zh-CN/docker安装mongo/` |
| **英文文章示例** | `http://localhost:4000/20261003/en/hello-world/` |

### 添加新的中文文章

```bash
# 方法1：直接在 zh-CN 目录创建
# 手动在 source/_posts/zh-CN/ 下新建 .md 文件

# 方法2：使用 hexo 命令后移动
hexo new "新文章标题"
# 将生成的文件从 source/_posts/ 移动到 source/_posts/zh-CN/
```

**文章 front-matter 示例：**

```yaml
---
title: 文章标题
date: 2026-10-03
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
layout: post
---
```

### 添加新的英文文章

```bash
# 直接在 en 目录创建 .md 文件
# 位置：source/_posts/en/
```

**文章 front-matter 示例：**

```yaml
---
title: Post Title in English
date: 2026-10-03
tags:
  - Tag1
  - Tag2
categories:
  - Category
layout: post
---
```

---

## ⚙️ 配置说明

### Hexo 主配置 (_config.yml)

```yaml
# 多语言支持
language:
  - zh-CN    # 简体中文（默认）
  - en       # 英语

# 国际化目录配置
i18n_dir: :lang
```

### Fluid 主题配置 (_config.fluid.yml)

```yaml
# 导航栏菜单（包含语言切换）
navbar:
  menu:
    - { key: "home", link: "/", icon: "iconfont icon-home-fill" }
    - { key: "archive", link: "/archives/", icon: "iconfont icon-archive-fill" }
    # 语言切换下拉菜单
    - key: "language"
      icon: "iconfont icon-language"
      submenu:
        - { name: "中文", link: "/zh-CN/" }
        - { name: "English", link: "/en/" }

# 自定义 JS 脚本
custom_js:
  - /js/i18n-redirect.js  # 语言自动检测与跳转
  - /js/seo-i18n.js       # SEO 多语言优化
```

---

## 🔧 功能详解

### 1. 浏览器语言检测逻辑

```
用户访问 / (根路径)
    ↓
检查 localStorage 是否有保存的语言偏好
    ↓ (有)
使用保存的语言偏好
    ↓ (无)
检测 navigator.languages / navigator.language
    ↓
匹配支持的语言（精确匹配 → 前缀匹配）
    ↓ (匹配成功)
跳转到对应语言版本
    ↓ (未匹配)
使用默认语言 (zh-CN)
```

**支持的浏览器语言匹配：**

- 精确匹配：`zh-CN` → `/zh-CN/`
- 前缀匹配：`en-US`, `en-GB`, `en-AU` → `/en/`

### 2. hreflang 标签生成示例

访问 `/zh-CN/docker安装mongo/` 时，自动生成：

```html
<link rel="alternate" hreflang="zh-CN" href="https://yoursite.com/zh-CN/docker安装mongo/" />
<link rel="alternate" hreflang="en" href="https://yoursite.com/en/docker-installation/" />
<link rel="alternate" hreflang="x-default" href="https://yoursite.com/zh-CN/docker安装mongo/" />
```

### 3. Open Graph 标签

```html
<meta property="og:locale" content="zh_CN" />
<meta property="og:locale:alternate" content="en_US" />
```

---

## 🌐 添加更多语言支持

### 步骤 1：修改 _config.yml

```yaml
language:
  - zh-CN    # 简体中文
  - en       # 英语
  - zh-TW    # 繁体中文  ← 新增
  - ja       # 日语      ← 新增
```

### 步骤 2：创建对应的目录和首页

```bash
mkdir source/_posts/zh-TW
mkdir source/_posts/ja
mkdir source/zh-TW
mkdir source/ja

# 创建首页
echo '---\nlayout: index\n---' > source/zh-TW/index.md
echo '---\nlayout: index\n---' > source/ja/index.md
```

### 步骤 3：更新脚本中的语言配置

编辑 `source/js/i18n-redirect.js`：

```javascript
const LANGUAGES = {
  'zh-CN': '/zh-CN/',
  'en': '/en/',
  'zh-TW': '/zh-TW/',  // 新增
  'ja': '/ja/'         // 新增
};
```

编辑 `source/js/seo-i18n.js`：

```javascript
languages: {
  'zh-CN': '/zh-CN/',
  'en': '/en/',
  'zh-TW': '/zh-TW/',  // 新增
  'ja': '/ja/'         // 新增
}
```

### 步骤 4：更新导航菜单

编辑 `_config.fluid.yml`：

```yaml
submenu:
  - { name: "中文", link: "/zh-CN/" }
  - { name: "English", link: "/en/" }
  - { name: "繁體中文", link: "/zh-TW/" }  # 新增
  - { name: "日本語", link: "/ja/" }        # 新增
```

### 步骤 5：（可选）添加 Fluid 主题语言包

Fluid 主题已内置以下语言：

- ✅ `zh-CN.yml` - 简体中文
- ✅ `zh-TW.yml` - 繁体中文
- ✅ `en.yml` - 英语
- ✅ `de.yml` - 德语
- ✅ `ja.yml` - 日语
- ✅ `eo.yml` - 世界语

如需其他语言，可在 `themes/fluid/languages/` 下新建 `.yml` 文件。

---

## 📊 SEO 最佳实践

### 1. 提交 sitemap 到搜索引擎

确保已安装 `hexo-generator-sitemap` 插件：

```bash
npm install hexo-generator-sitemap --save
```

在 `_config.yml` 中添加：

```yaml
sitemap:
  path: sitemap.xml
```

### 2. 在 Google Search Console 中注册

1. 访问 [Google Search Console](https://search.google.com/search-console)
2. 添加你的网站
3. 提交 sitemap.xml
4. 在"国际定位"中设置目标国家/语言

### 3. 使用 hreflang 标签

✅ 已自动生成，无需手动添加。

### 4. 内容翻译建议

- 不要使用机器翻译（Google 翻译等），质量差且可能被搜索引擎降权
- 聘请专业翻译或使用翻译管理平台（Crowdin、Poedit）
- 保持各语言版本的 URL 结构一致
- 确保所有语言版本的内容质量相当

---

## 🐛 常见问题排查

### Q1: 访问根路径没有自动跳转？

**原因**：

- JavaScript 未加载
- 浏览器禁用了 localStorage

**解决方案**：

1. 检查浏览器控制台是否有错误
2. 确认 `custom_js` 配置正确
3. 尝试清除缓存后刷新

### Q2: 英文页面显示的是中文界面？

**原因**：

- Fluid 主题根据页面语言自动选择语言包
- 如果页面 lang 属性不正确，可能导致语言包加载错误

**解决方案**：

1. 检查 `<html lang="...">` 属性是否正确
2. 确认 `seo-i18n.js` 正常执行
3. 查看 `themes/fluid/languages/en.yml` 是否存在

### Q3: hreflang 标签没有生成？

**原因**：

- `seo-i18n.js` 未加载
- 脚本执行时机不对

**解决方案**：

1. 打开浏览器开发者工具 → Elements → Head
2. 搜索 "hreflang" 或 "alternate"
3. 检查控制台是否有 `[SEO I18n]` 开头的日志

### Q4: 如何禁用自动跳转功能？

编辑 `source/js/i18n-redirect.js`，注释掉以下代码：

```javascript
// 注释这段代码即可禁用自动跳转
// if (!isLanguageSpecificPage(currentPath)) {
//   const bestLang = detectBestLanguage();
//   redirectToLanguage(bestLang);
// }
```

---

## 📝 更新日志

### 2026-10-03

- ✅ 初始版本发布
- ✅ 实现多语言目录结构
- ✅ 添加浏览器语言自动检测
- ✅ 实现 SEO 优化（hreflang、Open Graph）
- ✅ 配置语言切换导航菜单
- ✅ 迁移现有中文文章到 zh-CN 目录

---

## 📚 参考资源

- [Hexo 国际化文档](https://hexo.io/docs/internationalization.html)
- [Fluid 主题文档](https://hexo.fluid-dev.com/docs/)
- [Google hreflang 标签指南](https://support.google.com/webmasters/answer/189077)
- [MDN - navigator.language](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language)

---

## 💡 技术支持

如有问题，请检查：

1. 浏览器控制台错误信息
2. 构建日志 (`npm run build`)
3. 本地服务器日志 (`npm run server`)

祝使用愉快！🎉
