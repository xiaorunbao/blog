---
title: React Rainbow Menu 组件完全指南
layout: post
date: 2026-09-30
tags:
  - React
  - 组件库
  - UI组件
  - 前端开发
  - TypeScript
  - 动画
  - 开源项目
categories:
  - 技术分享
  - 开源项目
comments: true
---

# 🌈 React Rainbow Menu - 高性能径向菜单组件

**@xiaorunbao/react-rainbow-menu** 是一个功能强大的 React 彩虹菜单组件，支持多层嵌套子菜单、流畅动画和主题定制。

[![npm version](https://img.shields.io/npm/v/@xiaorunbao/react-rainbow-menu.svg)](https://www.npmjs.com/package/@xiaorunbao/react-rainbow-menu)
[![license](https://img.shields.io/npm/l/@xiaorunbao/react-rainbow-menu.svg)](https://github.com/xiaorunbao/react-rainbow-menu/blob/master/LICENSE)
[![downloads](https://img.shields.io/npm/dt/@xiaorunbao/react-rainbow-menu.svg)](https://www.npmjs.com/package/@xiaorunbao/react-rainbow-menu)

## ✨ 核心特性

### 为什么选择 Rainbow Menu?

- 🚀 **开箱即用** - 零配置启动，3 行代码实现径向菜单
- 🎨 **高度可定制** - CSS 变量驱动主题系统，支持深色模式
- 💫 **流畅动画** - 内置 fade/scale/rotate 动画，支持组合使用
- 🔥 **性能优化** - GPU 加速动画，60fps 流畅体验
- 📱 **移动端友好** - 触摸优化，完美适配各种屏幕尺寸
- 🧩 **TypeScript** - 完整类型定义，智能提示友好
- 🌳 **无限层级** - 支持多层嵌套子菜单，带返回导航
- ⚡ **轻量级** - Gzip 后 < 10KB，零依赖

## 🎮 在线演示 & 效果展示

👉 [交互式 Demo](https://xiaorunbao.github.io/storybook/)

### 🎬 动画效果预览

![Rainbow Menu Demo](demo.gif)

*上图展示了 Rainbow Menu 的流畅动画效果，包括菜单展开、子菜单嵌套和多种交互状态*

## 📦 快速安装

```bash
# npm
npm install @xiaorunbao/react-rainbow-menu

# yarn
yarn add @xiaorunbao/react-rainbow-menu

# pnpm
pnpm add @xiaorunbao/react-rainbow-menu
```

## 🚀 5 分钟上手

### 基础用法：圆点按钮触发器

最常用的场景 - 点击圆形按钮弹出菜单，菜单位置与按钮中心完全对齐。

```tsx
import React, { useState, useRef } from 'react';
import { Menu, MenuItem, SubMenu } from '@xiaorunbao/react-rainbow-menu';

function App() {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 200, y: 200 });
  const circleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击圆点按钮时计算精确中心位置
  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!circleRef.current || !containerRef.current) return;
    
    // 获取按钮的边界矩形
    const buttonRect = circleRef.current.getBoundingClientRect();
    // 获取容器的边界矩形（用于坐标转换）
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // 计算按钮相对于容器的中心坐标
    const centerX = buttonRect.left - containerRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top - containerRect.top + buttonRect.height / 2;
    
    setPosition({ x: centerX, y: centerY });
    setShow(!show);
  };

  return (
    <div 
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', position: 'relative' }}
      onClick={() => setShow(false)} // 点击其他区域关闭菜单
    >
      {/* 64px 圆形触发按钮 */}
      <div
        ref={circleRef}
        onClick={handleCircleClick}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'absolute',
          left: '200px',
          top: '200px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
      >
        菜单
      </div>

      {/* 径向菜单 - 中心与按钮对齐 */}
      <Menu
        show={show}
        centerX={position.x}
        centerY={position.y}
        innerRadius={50}   // 内圈半径
        outerRadius={110}  // 外圈半径
        maxLayers={2}      // 最大嵌套层数
        animation="scale"  // 缩放动画
      >
        <MenuItem data="home" onItemClick={() => console.log('首页')}>
          🏠 首页
        </MenuItem>
    
        <MenuItem data="profile" onItemClick={() => console.log('个人中心')}>
          👤 个人中心
        </MenuItem>
    
        <SubMenu
          data="tools"
          itemView="🛠️ 工具箱"
          displayView="← 返回"
          displayPosition="center"
        >
          <MenuItem data="calc" onItemClick={() => console.log('计算器')}>
            🧮 计算器
          </MenuItem>
      
          <MenuItem data="notes" onItemClick={() => console.log('笔记')}>
            📝 笔记
          </MenuItem>
        </SubMenu>

        <MenuItem data="settings" onItemClick={() => console.log('设置')}>
          ⚙️ 设置
        </MenuItem>
      </Menu>
    </div>
  );
}

export default App;
```

### 右键上下文菜单

适用于桌面应用的右键菜单场景。

```tsx
<div
  onContextMenu={(e) => {
    e.preventDefault(); // 阻止浏览器默认右键菜单
    setPosition({ x: e.clientX, y: e.clientY });
    setShow(true);
  }}
  onClick={() => setShow(false)}
  style={{ width: '100vw', height: '100vh' }}
>
  <Menu
    show={show}
    centerX={position.x}
    centerY={position.y}
    innerRadius={75}
    outerRadius={150}
    animation={['fade', 'scale']}
    animationTimeout={150}
    drawBackground // 显示半透明背景圆
  >
    <MenuItem>复制</MenuItem>
    <MenuItem>粘贴</MenuItem>
    <SubMenu itemView="更多选项">
      <MenuItem>设置</MenuItem>
      <MenuItem>帮助</MenuItem>
    </SubMenu>
  </Menu>
</div>
```

## 🎨 主题定制

### 使用 CSS 变量自定义样式

```css
/* 全局默认主题 */
:root {
  --rrm-color: #667eea;              /* 主色调 */
  --rrm-background-color: rgba(255, 255, 255, 0.95); /* 背景色 */
  --rrm-item-border-radius: 8px;     /* 菜单项圆角 */
  --rrm-item-font-size: 14px;        /* 字体大小 */
  --rrm-item-padding: 8px;           /* 内边距 */
}

/* 深色模式 */
[data-theme="dark"] {
  --rrm-color: #818cf8;
  --rrm-background-color: rgba(15, 23, 42, 0.95);
}

/* 自定义渐变背景 */
.rainbow-menu-custom {
  --rrm-background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

### 单独控制菜单项样式

```tsx
<MenuItem
  data="special"
  style={{ fill: '#ef4444' }} // SVG fill 属性
  onItemClick={handleClick}
>
  <span style={{ fontWeight: 'bold', color: 'white' }}>
    ⭐ 特殊项
  </span>
</MenuItem>
```

## 📚 API 参考

### Menu 组件

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `show` | `boolean` | `false` | 控制菜单显示/隐藏 |
| `centerX` | `number` | `0` | 菜单中心 X 坐标 |
| `centerY` | `number` | `0` | 菜单中心 Y 坐标 |
| `innerRadius` | `number` | `60` | 内圈半径 (px) |
| `outerRadius` | `number` | `120` | 外圈半径 (px) |
| `animation` | `string \| string[]` | `"fade"` | 动画类型 |
| `animationTimeout` | `number` | `150` | 动画时长 (ms) |
| `maxLayers` | `number` | `3` | 最大嵌套层数 |
| `drawBackground` | `boolean` | `false` | 显示背景圆 |
| `theme` | `'light' \| 'dark'` | `'light'` | 主题模式 |

#### 动画类型

- `fade` - 淡入淡出
- `scale` - 缩放效果
- `rotate` - 旋转效果

**组合使用**: `animation={['fade', 'scale']}` 同时应用多种动画

### MenuItem 组件

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `data` | `any` | 附加数据，传递给回调函数 |
| `onItemClick` | `(event, index, data) => void` | 点击事件处理 |
| `style` | `React.CSSProperties` | 自定义样式 |

**回调参数说明**:

- `event`: React 鼠标事件对象
- `index`: 菜单项索引 (从 0 开始)
- `data`: 通过 `data` 属性传入的数据

### SubMenu 组件

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `itemView` | `string \| ReactNode` | - | 在父菜单中显示的内容 |
| `displayView` | `string \| ReactNode` | `"← Back"` | 返回按钮文字/组件 |
| `displayPosition` | `DisplayPosition` | `"center"` | 返回按钮位置 |
| `data` | `any` | - | 附加数据 |
| `onItemClick` | `function` | - | 子菜单项点击回调 |
| `onDisplayClick` | `function` | - | 返回按钮点击回调 |

#### DisplayPosition 可选值

- `"center"` - 中心圆形返回按钮
- `"top"` / `"bottom"` / `"left"` / `"right"` - 对应方向的返回按钮

## 🎯 应用场景与实战案例

### 📌 最适合的场景

| 场景 | 应用示例 | 推荐配置 |
|------|---------|---------|
| **🖥️ 桌面应用** | 右键上下文菜单、工具面板 | `animation: 'fade'`, `drawBackground: true` |
| **📱 移动端 APP** | 浮动操作按钮 (FAB)、手势菜单 | `animation: 'scale'`, 触摸优化 |
| **🎮 游戏界面** | 技能轮盘、道具选择器 | `animation: ['rotate', 'scale']`, 大半径 |
| **🎨 设计工具** | 颜色选择器、画笔选项 | 自定义主题, 图标菜单项 |
| **📊 数据可视化** | 图表交互控件 | 轻量动画, 快速响应 |
| **🛒 电商网站** | 快速筛选、排序选项 | 简洁风格, 2层嵌套 |

### 💡 实战案例：FAB 浮动按钮菜单

```tsx
import React, { useState } from 'react';
import { Menu, MenuItem } from '@xiaorunbao/react-rainbow-menu';

// 移动端常见的浮动操作按钮（FAB）实现
function FloatingActionButton() {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 120 });

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* FAB 按钮 */}
      <button
        onClick={() => {
          // 动态计算按钮位置（右下角）
          setPosition({
            x: window.innerWidth - 80,
            y: window.innerHeight - 120
          });
          setShow(!show);
        }}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
          zIndex: 1000,
          transition: 'transform 0.2s ease'
        }}
      >
        {show ? '✕' : '+'}
      </button>

      {/* 径向菜单 */}
      <Menu
        show={show}
        centerX={position.x}
        centerY={position.y}
        innerRadius={40}
        outerRadius={100}
        animation="scale"
        maxLayers={1}
      >
        <MenuItem onItemClick={() => console.log('新建文件')}>
          📄 新建
        </MenuItem>
        <MenuItem onItemClick={() => console.log('上传文件')}>
          ⬆️ 上传
        </MenuItem>
        <MenuItem onItemClick={() => console.log('搜索')}>
          🔍 搜索
        </MenuItem>
        <MenuItem onItemClick={() => console.log('分享')}>
          📤 分享
        </MenuItem>
      </Menu>

      {/* 点击遮罩关闭菜单 */}
      {show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999
          }}
          onClick={() => setShow(false)}
        />
      )}
    </div>
  );
}
```

### 最佳实践

#### 1. 精确居中对齐

```typescript
// 推荐：使用 getBoundingClientRect() 计算精确中心
const handleClick = (e: React.MouseEvent, triggerRef: RefObject<HTMLDivElement>) => {
  if (!triggerRef.current) return;
  
  const rect = triggerRef.current.getBoundingClientRect();
  const parentRect = containerRef.current?.getBoundingClientRect();
  
  if (parentRect) {
    const centerX = rect.left - parentRect.left + rect.width / 2;
    const centerY = rect.top - parentRect.top + rect.height / 2;
    setPosition({ x: centerX, y: centerY });
  }
};
```

#### 2. 性能优化建议

```tsx
// 使用 useCallback 避免重复创建函数
const handleItemClick = useCallback((event, index, data) => {
  console.log('Clicked:', data);
  setShow(false);
}, []);

// 合理设置 maxLayers 避免过深嵌套
<Menu maxLayers={2}> {/* 推荐不超过 3 层 */}
```

#### 3. 无障碍访问 (A11y)

```tsx
<MenuItem
  role="menuitem"
  aria-label="保存文件"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSave();
    }
  }}
  onItemClick={handleSave}
>
  💾 保存
</MenuItem>
```

## 🔄 从 v1.x 升级到 v2.x

如果你正在使用旧版本 `@spaceymonk/react-radial-menu`，迁移非常简单：

```bash
# 卸载旧包
npm uninstall @spaceymonk/react-radial-menu

# 安装新包
npm install @xiaorunbao/react-rainbow-menu
```

**代码改动**:

```diff
- import { Menu, MenuItem, SubMenu } from '@spaceymonk/react-radial-menu';
+ import { Menu, MenuItem, SubMenu } from '@xiaorunbao/react-rainbow-menu';
```

API 完全兼容，无需修改任何业务逻辑！✨

## 🐛 常见问题

### Q: 菜单位置偏移不正确？

**A**: 确保使用 `getBoundingClientRect()` 计算相对坐标，而不是直接使用 `clientX/clientY`。

```typescript
// 错误：直接使用鼠标坐标（如果容器不是全屏）
setPosition({ x: e.clientX, y: e.clientY });

// 正确：减去容器的偏移量
const offset = containerRef.current?.getBoundingClientRect();
if (offset) {
  setPosition({
    x: e.clientX - offset.left,
    y: e.clientY - offset.top
  });
}
```

### Q: 如何在菜单外部点击时关闭？

**A**: 库不会自动关闭菜单，你需要自己管理状态：

```tsx
<div onClick={() => setShow(false)}>
  <Menu show={show}>
    <MenuItem onItemClick={() => setShow(false)}>
      点击关闭
    </MenuItem>
  </Menu>
</div>
```

### Q: 子菜单不显示？

**A**: 确保每个层级的子菜单至少有 2 个子元素：

```tsx
<SubMenu itemView="Parent">
  {/* 至少需要 2 个子元素 */}
  <MenuItem>Child 1</MenuItem>
  <MenuItem>Child 2</MenuItem>
</SubMenu>
```

### Q: 动画卡顿怎么办？

**A**: 尝试以下优化：

1. 减小 `innerRadius` 和 `outerRadius`
2. 降低 `animationTimeout` 到 100-120ms
3. 使用单一动画而非组合动画
4. 确保 `maxLayers` 不超过 3

## 📊 性能基准与对比

### 性能数据

| 指标 | 数值 | 说明 |
| --- | --- | --- |
| **Gzip 大小** | ~8KB | 轻量级，加载迅速 |
| **首次渲染** | < 16ms | 即时响应 |
| **动画帧率** | 60 FPS | 流畅体验 |
| **内存占用** | ~2MB | 低内存消耗 |
| **最大层级数** | 无限制 (推荐 ≤ 3) | 灵活嵌套 |

*测试环境: Chrome 120, MacBook Pro M1, 5 个菜单项*

### 与其他方案对比

| 特性 | Rainbow Menu | 原生 Context Menu | 其他 Radial Menu 库 |
|------|-------------|------------------|-------------------|
| **自定义程度** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **动画效果** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| **TypeScript 支持** | ✅ 完整 | ❌ | 部分支持 |
| **移动端适配** | ✅ 优秀 | ❌ | 一般 |
| **嵌套子菜单** | ✅ 无限层级 | ❌ | 有限支持 |
| **主题定制** | CSS 变量 | 系统依赖 | 有限 |
| **包大小** | ~8KB | 0 (原生) | 15-50KB |

## 🔧 高级技巧

### 1. 动态菜单项渲染

```tsx
// 根据用户权限动态生成菜单项
function DynamicMenu({ userRole }: { userRole: string }) {
  // 定义不同角色可用的菜单项
  const menuConfig = {
    admin: [
      { id: 'users', icon: '👥', label: '用户管理' },
      { id: 'settings', icon: '⚙️', label: '系统设置' },
      { id: 'logs', icon: '📋', label: '操作日志' }
    ],
    user: [
      { id: 'profile', icon: '👤', label: '个人中心' },
      { id: 'logout', icon: '🚪', label: '退出登录' }
    ]
  };

  const items = menuConfig[userRole] || menuConfig.user;

  return (
    <Menu show={show} centerX={x} centerY={y}>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          data={item.id}
          onItemClick={(event, index, data) => handleMenuClick(data)}
        >
          {item.icon} {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}
```

### 2. 键盘导航支持

```tsx
// 添加键盘快捷键支持（提升无障碍性）
function AccessibleMenu() {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const itemCount = 4; // 菜单项总数
    
    switch(e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        // 向下/右移动焦点
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        // 向上/左移动焦点
        e.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? itemCount - 1 : prev - 1);
        break;
        
      case 'Enter':
      case ' ':
        // 选中当前聚焦的菜单项
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSelect(focusedIndex);
        }
        break;
        
      case 'Escape':
        // 关闭菜单
        setShow(false);
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown} tabIndex={0}>
      <Menu show={show}>
        {/* 菜单项根据 focusedIndex 高亮显示 */}
      </Menu>
    </div>
  );
}
```

### 3. 与状态管理集成（Redux/Zustand）

```tsx
import { useAppDispatch, useAppSelector } from './store';
import { openMenu, closeMenu, selectMenuItem } from './menuSlice';

// 集成 Redux 状态管理的径向菜单
function ReduxMenu() {
  const dispatch = useAppDispatch();
  const { show, position } = useAppSelector(state => state.menu);

  return (
    <>
      {/* 触发按钮 */}
      <button onClick={() => dispatch(openMenu({ x: 100, y: 100 }))}>
        打开菜单
      </button>

      {/* 径向菜单 */}
      <Menu
        show={show}
        centerX={position.x}
        centerY={position.y}
      >
        <MenuItem onItemClick={() => {
          dispatch(selectMenuItem('option1'));
          dispatch(closeMenu());
        }}>
          选项 1
        </MenuItem>
        
        <MenuItem onItemClick={() => {
          dispatch(selectMenuItem('option2'));
          dispatch(closeMenu());
        }}>
          选项 2
        </MenuItem>
      </Menu>
    </>
  );
}
```

## 🎯 总结与推荐

### ✅ 推荐使用场景

- 需要**高度定制化**的径向菜单
- 追求**流畅动画效果**的现代化应用
- 需要**多层嵌套**的复杂菜单结构
- **跨平台**项目（Web + 移动端）
- 对**包体积敏感**的性能优先项目

### ⚠️ 注意事项

1. **坐标计算**: 务必使用 `getBoundingClientRect()` 进行精确的位置计算
2. **性能考量**: 嵌套层级建议不超过 3 层，避免性能问题
3. **移动端测试**: 在真机上测试触摸事件和手势操作
4. **无障碍性**: 为生产环境添加键盘导航和 ARIA 属性
5. **状态管理**: 复杂应用建议集成全局状态管理（Redux/Zustand）

### 🌟 项目亮点

- 📦 **零依赖** - 无需安装其他第三方库
- 🎨 **CSS 变量驱动** - 主题切换极其灵活
- ⚡ **GPU 加速** - 使用 transform 实现硬件加速动画
- 🧩 **组件化设计** - Menu/MenuItem/SubMenu 职责清晰
- 📝 **TypeScript 友好** - 完整的类型定义和智能提示
- 🔄 **向后兼容** - 从 v1.x 升级无需修改业务代码

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/xiaorunbao/react-rainbow-menu.git
cd react-rainbow-menu

# 安装依赖
npm install

# 启动开发服务器 (Storybook)
npm run storybook

# 构建生产版本
npm run rollup
```

## 📄 许可证

[MIT License](LICENSE) © 2024 [xiaorunbao](https://github.com/xiaorunbao)

## 🙏 致谢

感谢 [spaceymonk](https://github.com/spaceymonk) 创建了原始的 react-radial-menu 项目，本库在其基础上进行了功能增强和优化。

## 📚 延伸阅读与相关资源

### 官方资源
- **GitHub 仓库**: [xiaorunbao/react-rainbow-menu](https://github.com/xiaorunbao/react-rainbow-menu)
- **npm 包**: [@xiaorunbao/react-rainbow-menu](https://www.npmjs.com/package/@xiaorunbao/react-rainbow-menu)
- **在线文档**: [Storybook 交互式文档](https://xiaorunbao.github.io/react-rainbow-menu/)
- **问题反馈**: [GitHub Issues](https://github.com/xiaorunbao/react-rainbow-menu/issues)

### 相关技术文章
- **React 径向菜单设计模式** - 了解径向/圆形 UI 的设计原理
- **CSS 动画性能优化** - 深入理解 GPU 加速和 transform 动画
- **React 组件设计最佳实践** - 学习如何构建可复用的 React 组件
- **TypeScript 与 React** - 掌握 React 项目中的 TypeScript 最佳实践

### 类似项目对比
- **[radial-menu](https://github.com/xxx/radial-menu)** - 另一个径向菜单实现
- **[context-menu](https://github.com/xxx/context-menu)** - 传统上下文菜单库
- **[floating-ui](https://floating-ui.com/)** - 通用的浮动定位工具库

---

## 💬 交流与讨论

如果你在使用过程中遇到问题，或者想要分享你的使用场景：

1. 在 **GitHub Issues** 提交问题或建议
2. 参与 **社区讨论**，分享你的使用经验
3. 欢迎 **提交 PR**，共同完善这个项目

---

*本文基于 [react-rainbow-menu](https://github.com/xiaorunbao/react-rainbow-menu) 项目整理*

*最后更新: 2026-09-30 | 作者: xiaorunbao*