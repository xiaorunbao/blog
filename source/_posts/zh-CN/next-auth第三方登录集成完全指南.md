---
title: Next-Auth v5 第三方登录集成完全指南（Google、Facebook）
layout: post
date: 2026-10-02
tags:
  - Next.js
  - Next-Auth
  - OAuth
  - 第三方登录
  - 认证
  - 前端开发
categories:
  - 技术分享
  - 前端开发
comments: true
---
# 🔐 Next-Auth v5 第三方登录集成完全指南

在现代 Web 应用中，**第三方登录（OAuth）**已成为提升用户体验的关键功能。本文将详细介绍如何使用 **next-auth v5 (Auth.js)** 在 Next.js 项目中集成 Google 和 Facebook 登录，并提供完整的实战代码和最佳实践。

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![next-auth](https://img.shields.io/badge/next--auth-5.0_beta-black)](https://next-auth.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)

## 📋 目录

- [为什么选择 Next-Auth?](#为什么选择-next-auth)
- [项目初始化与安装](#项目初始化与安装)
- [核心配置文件解析](#核心配置文件解析)
- [Google OAuth 集成详解](#google-oauth-集成详解)
- [Facebook OAuth 集成详解](#facebook-oauth-集成详解)
- [认证流程架构图](#认证流程架构图)
- [Session 管理最佳实践](#session-管理最佳实践)
- [路由保护方案](#路由保护方案)
- [常见问题与解决方案](#常见问题与解决方案)
- [生产环境部署注意事项](#生产环境部署注意事项)

---

## 🎯 为什么选择 Next-Auth?

在众多认证方案中，**Next-Auth** 具有以下优势：

### ✅ 核心优势

| 特性                         | 说明                                              |
| ---------------------------- | ------------------------------------------------- |
| **开箱即用**           | 内置 Google、Facebook、GitHub 等 50+ OAuth 提供者 |
| **类型安全**           | 完整的 TypeScript 支持                            |
| **Session 管理**       | 自动处理 JWT/Database Session                     |
| **安全性**             | 内置 CSRF 保护、HTTPS 强制等安全机制              |
| **灵活性**             | 支持自定义登录页面、回调函数等                    |
| **Active Development** | v5 beta 版本持续更新，性能优化                    |

### 📊 技术栈要求

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "next-auth": "^5.0.0-beta"
  }
}
```

> **注意**: 本文基于 **next-auth@5.0.0-beta.21** 编写，API 可能与 v4 有差异。

---

## 🚀 项目初始化与安装

### 第一步：安装依赖

```bash
# 使用 npm
npm install next-auth@beta

# 使用 pnpm (推荐)
pnpm add next-auth@beta

# 使用 yarn
yarn add next-auth@beta
```

### 第二步：配置环境变量

创建 `.env.local` 文件：

```bash
# ===========================================
# NextAuth.js 核心配置
# ===========================================

# 必需: 用于加密 JWT 和会话 cookie
# 生成方法: openssl rand -base64 32
AUTH_SECRET=your-super-secret-key-here-change-in-production

# 必需: 应用的完整 URL (NextAuth 回调地址)
NEXTAUTH_URL=http://localhost:3000

# ------------------------------------------
# Google OAuth 配置 (可选)
# ------------------------------------------
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# ------------------------------------------
# Facebook OAuth 配置 (可选)
# ------------------------------------------
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### ⚠️ 安全提醒

- ❌ **切勿将 `.env.local` 提交到 Git 仓库**
- ✅ 生产环境必须更改默认的 `AUTH_SECRET`
- ✅ 使用强随机密钥生成器创建 `AUTH_SECRET`
- ✅ OAuth 凭据必须与提供商控制台配置一致

---

## 📁 核心配置文件解析

### 1️⃣ 主配置文件 `auth.ts`

这是整个认证系统的**核心文件**，位于项目根目录：

```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"

// 导出 NextAuth 的核心功能
export const {
  handlers,    // API 路由处理器 (用于 route.ts)
  auth,        // 服务端 auth() 函数 (Server Components)
  signIn,      // 客户端 signIn 函数
  signOut      // 客户端 signOut 函数
} = NextAuth({
  // 加密密钥 - 从环境变量读取
  secret: process.env.AUTH_SECRET || 'fallback-secret',
  
  // 配置支持的登录方式
  providers: [
    // 1. Google OAuth 登录
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  
    // 2. Facebook OAuth 登录
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  
    // 3. 邮箱密码登录 (演示用，生产环境需对接数据库)
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // ⚠️ 开发环境硬编码凭证 (仅用于测试!)
        if (credentials?.email === "admin@nocaped.com" &&
            credentials?.password === "password123") {
          return {
            id: "1",
            name: "Admin User",
            email: "admin@example.com",
            image: "/avatar.png"
          }
        }
      
        // 认证失败返回 null
        return null
      }
    })
  ],
  
  // 自定义页面路径
  pages: {
    signIn: '/auth/signin',  // 自定义登录页
  },
  
  // Session 配置 (可选)
  session: {
    strategy: 'jwt',  // 使用 JWT 策略 (推荐)
    maxAge: 30 * 24 * 60 * 60,  // 30 天过期
  },
  
  // 回调函数 (用于扩展 Session 和 JWT)
  callbacks: {
    async jwt({ token, user }) {
      // 首次登录时，将 user 信息合并到 token
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // 将 token 中的信息传递给 session
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
```

#### 🔑 关键导出说明

| 导出项        | 用途             | 使用场景                                 |
| ------------- | ---------------- | ---------------------------------------- |
| `handlers`  | API 路由处理     | `route.ts` 中处理 `/api/auth/*` 请求 |
| `auth()`    | 获取当前 session | Server Components / Server Actions       |
| `signIn()`  | 触发登录流程     | 客户端组件中调用                         |
| `signOut()` | 触发登出流程     | 客户端组件中调用                         |

---

### 2️⃣ API 路由 `route.ts`

创建 `app/api/auth/[...nextauth]/route.ts`：

```typescript
import { handlers } from "@/auth"

// 处理 GET 请求 (用于 OAuth 回调、获取 session 等)
export const GET = async (req: Request) => {
  const response = await handlers.GET(req);
  return response;
};

// 处理 POST 请求 (用于登录、登出等操作)
export const POST = async (req: Request) => {
  const response = await handlers.POST(req);
  return response;
};
```

#### 📌 工作原理

这是一个 **Catch-all 路由** (`[...nextauth]`)，它会捕获所有匹配 `/api/auth/*` 的请求，包括：

- `/api/auth/signin` - 登录页面
- `/api/auth/callback/google` - Google OAuth 回调
- `/api/auth/callback/facebook` - Facebook OAuth 回调
- `/api/auth/signout` - 登出
- `/api/auth/session` - 获取当前 session
- `/api/auth/csrf` - CSRF token

---

### 3️⃣ 全局 SessionProvider

在 `app/layout.tsx` (根布局) 中包裹应用：

```tsx
import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 
          SessionProvider 为所有子组件提供 session 上下文
          使 useSession() hook 在任何组件中可用
          自动处理 session 刷新
        */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

#### ⚡ 为什么需要 SessionProvider?

- 提供 **React Context**，让任何组件都能访问 session 状态
- 自动 **刷新过期的 session**
- 触发 **UI 更新** 当 session 变化时

---

## 🌐 Google OAuth 集成详解

### 步骤 1：创建 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下 API：
   - **Google+ API** (或 People API)
   - **OAuth 2.0 API**

### 步骤 2：配置 OAuth 2.0 凭据

1. 进入 **APIs & Services → Credentials**
2. 点击 **Create Credentials → OAuth client ID**
3. 选择 **Web application** 类型
4. 配置授权域名：

#### **Authorized JavaScript origins** (授权 JavaScript 来源)

```
http://localhost:3000          # 开发环境
https://yourdomain.com        # 生产环境
https://www.yourdomain.com    # 生产环境 (www 子域名)
```

#### **Authorized redirect URIs** (授权重定向 URI)

```
http://localhost:3000/api/auth/callback/google   # 开发环境
https://yourdomain.com/api/auth/callback/google # 生产环境
```

### 步骤 3：获取凭据并配置环境变量

复制生成的 **Client ID** 和 **Client Secret** 到 `.env.local`：

```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

### 步骤 4：测试 Google 登录

```bash
# 重启开发服务器
npm run dev

# 访问登录页面
# http://localhost:3000/auth/signin
```

点击 **"Sign in with Google"** 按钮，完成授权流程后自动跳转到 `/dashboard`。

#### 🔍 Google 登录返回的用户信息

```typescript
{
  user: {
    name: "张三",                    // 用户名
    email: "zhangsan@gmail.com",     // 邮箱 (已验证)
    image: "https://lh3.googleusercontent.com/..."  // 头像 URL
  }
}
```

---

## 📘 Facebook OAuth 集成详解

### 步骤 1：创建 Facebook App

1. 访问 [Facebook Developers](https://developers.facebook.com/)
2. 点击 **My Apps → Create App**
3. 选择 **Consumer** 类型
4. 填写应用名称和联系邮箱

### 步骤 2：配置 Facebook Login

1. 进入应用仪表板 (**Dashboard**)
2. 添加产品 **Facebook Login**
3. 在 **Settings → Valid OAuth Redirect URIs** 中添加：

```
http://localhost:3000/api/auth/callback/facebook   # 开发环境
https://yourdomain.com/api/auth/callback/facebook # 生产环境
```

### 步骤 3：获取 App 凭据

在 **Settings → Basic** 中找到：

- **App ID** → 对应 `FACEBOOK_CLIENT_ID`
- **App Secret** → 对应 `FACEBOOK_CLIENT_SECRET`

### 步骤 4：配置环境变量

```bash
FACEBOOK_CLIENT_ID=123456789012345
FACEBOOK_CLIENT_SECRET=abcdef1234567890abcdef
```

### ⚠️ Facebook 开发模式限制

- 开发模式下，只有 **Facebook App 的管理员/开发者/测试员** 可以登录
- 发布到生产环境前，需要在 Facebook Developers 中提交审核

---

## 🏗️ 认证流程架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     认证系统架构图                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐     ┌─────────────┐     ┌──────────────────┐  │
│  │  前端    │     │  API 路由   │     │   Auth 配置      │  │
│  │  组件    │────▶│ /api/auth/  │────▶│    auth.ts       │  │
│  └─────────┘     └─────────────┘     └──────────────────┘  │
│       │                                       │            │
│       │ useSession()                          │ Providers   │
│       │ signIn()/signOut()                    │             │
│       ▼                                       ▼            │
│  ┌─────────┐                         ┌─────────────────┐   │
│  │ Session │                         │  1. Google      │   │
│  │ Provider│◀────────────────────────│  2. Facebook    │   │
│  │(layout) │    JWT Session          │  3. Credentials │   │
│  └─────────┘                         └─────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 完整的 OAuth 登录流程

```
用户访问受保护页面 (如 /dashboard)
         │
         ▼
   ┌─────────────┐
   │ 检查 Session │
   └──────┬──────┘
          │
    ┌─────┴─────┐
    │           │
  有Session   无Session
    │           │
    ▼           ▼
  显示页面   重定向到 /auth/signin
              │
              ▼
        ┌─────────────────────────────────┐
        │         选择登录方式              │
        ├─────────┬───────────┬───────────┤
        │ Google  │ Facebook  │ Email/Pwd  │
        └────┬────┴─────┬─────┴─────┬─────┘
             │          │             │
             ▼          ▼             ▼
        ┌────────┐ ┌────────┐  ┌──────────┐
        │ OAuth  │ │ OAuth  │  │  验证凭证  │
        │ 重定向  │ │ 重定向  │  │ (数据库)  │
        └───┬────┘ └───┬────┘  └─────┬────┘
            │           │              │
            ▼           ▼              ▼
        ┌─────────────────────────────────┐
        │     回调到 /api/auth/callback    │
        │     验证成功 → 创建 Session      │
        └──────────────┬──────────────────┘
                       │
                       ▼
              重定向到 /dashboard (或 callbackUrl)
```

---

## 💾 Session 管理最佳实践

### 1️⃣ 客户端使用 Session (useSession Hook)

适用于**客户端组件** (`'use client'`)：

```typescript
'use client'
import { useSession } from 'next-auth/react'
import { signIn, signOut } from 'next-auth/react'

function UserProfile() {
  // 获取当前 session 状态
  const { data: session, status } = useSession()
  
  // 三种状态: 'loading' | 'authenticated' | 'unauthenticated'
  if (status === 'loading') {
    return <div>Loading...</div>
  }
  
  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.name}!</p>
        <p>Email: {session.user?.email}</p>
        <img src={session.user?.image} alt="Avatar" />
      
        {/* 登出按钮 */}
        <button onClick={() => signOut({ callbackUrl: '/' })}>
          Sign Out
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <p>Please sign in</p>
    
      {/* 登录按钮 - 指定使用 Google 登录 */}
      <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
        Sign in with Google
      </button>
    </div>
  )
}
```

#### 📦 Session 对象结构

```typescript
interface Session {
  user: {
    name: string | null;        // 用户名
    email: string | null;       // 邮箱
    image: string | null;       // 头像 URL
    id?: string;                // 自定义字段 (需通过回调添加)
  };
  expires: string;              // 过期时间 (ISO 8601 格式)
}
```

### 2️⃣ 服务端使用 Session (auth() 函数)

适用于 **Server Components** 或 **Server Actions**：

```typescript
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

// Server Component 示例
async function DashboardPage() {
  // 在服务端获取当前 session
  const session = await auth()
  
  // 如果未登录，重定向到登录页
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  return (
    <div>
      <h1>Welcome, {session.user.name}!</h1>
      <p>This is a protected page.</p>
    </div>
  )
}
```

#### 💡 何时使用服务端 vs 客户端?

| 场景             | 推荐方式         | 原因                    |
| ---------------- | ---------------- | ----------------------- |
| Server Component | `auth()`       | 无需额外 JS，SEO 友好   |
| Client Component | `useSession()` | 需要交互性 (按钮点击等) |
| Server Action    | `auth()`       | 表单提交、数据变更      |
| Middleware       | `getToken()`   | 路由保护                |

### 3️⃣ 手动触发登录/登出

```typescript
import { signIn, signOut } from 'next-auth/react'

// ====== 登录 ======

// 方式 1: 使用默认登录页
await signIn()

// 方式 2: 指定 OAuth 提供者
await signIn('google')                    // Google 登录
await signIn('facebook')                  // Facebook 登录
await signIn('credentials', {            // 邮箱密码登录
  email: 'user@example.com',
  password: 'password123',
  redirect: false  // 不自动重定向，手动处理结果
})

// 方式 3: 指定登录成功后的跳转地址
await signIn('google', { callbackUrl: '/dashboard' })

// ====== 登出 ======

// 登出并跳转到首页
await signOut({ callbackUrl: '/' })

// 仅登出不跳转
await signOut({ redirect: false })
```

---

## 🛡️ 路由保护方案

### 方案 1: 客户端保护 (适合 SPA 场景)

使用 `useSession` + 条件渲染/重定向：

```typescript
// app/dashboard/page.tsx
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // 未认证时重定向到登录页
      router.push('/auth/signin')
    },
  })

  const router = useRouter()

  // 加载中显示 loading 状态
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // 已认证，显示受保护内容
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome back, {session?.user?.name}!</p>
    
      {/* 受保护的 dashboard 内容 */}
    </div>
  )
}
```

#### ✅ 优点

- 实现简单
- 用户体验好 (无页面刷新)
- 适合单页应用

#### ❌ 缺点

- 安全性较低 (客户端可被绕过)
- 需要 JavaScript 执行

---

### 方案 2: 服务端保护 (更安全，推荐)

使用 `auth()` + **中间件 (Middleware)**：

#### 创建 `middleware.ts` (项目根目录)

```typescript
// middleware.ts
export { default } from 'next-auth/middleware'

// 配置需要认证的路由匹配规则
export const config = {
  matcher: [
    /*
     * 匹配所有以以下路径开头的请求:
     * - /dashboard (用户仪表板)
     * - /settings (设置页面)
     * - /protected (其他受保护页面)
     */
    '/dashboard/:path*',
    '/settings/:path*',
    '/protected/:path*',
  ]
}
```

#### 工作原理

当用户访问匹配的路由时：

1. **Middleware** 拦截请求
2. 检查是否存在有效的 session
3. **有 session**: 正常放行，显示页面
4. **无 session**: 自动重定向到 `/auth/signin`

#### ✅ 优点

- **安全性高** (服务端验证，无法绕过)
- **性能好** (未认证时直接重定向，不加载页面内容)
- **SEO 友好** (搜索引擎爬虫也会被拦截)

#### ❌ 缺点

- 配置稍复杂
- 需要理解 Middleware 匹配规则

---

### 方案 3: 混合方案 (推荐用于生产环境)

结合两者的优势：

```typescript
// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

// Server Component: 服务端验证
async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  // 传递 session 数据给客户端组件
  return <DashboardClient user={session.user} }
}

// DashboardClient.tsx (客户端组件)
'use client'
import { useSession } from 'next-auth/react'

export function DashboardClient({ user }: { user: any }) {
  // 可以在这里添加交互逻辑
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {/* 交互式内容 */}
    </div>
  )
}
```

---

## ❓ 常见问题与解决方案

### Q1: 登录后无法跳转到 dashboard?

**可能原因及解决方案**:

1. **NEXTAUTH_URL 未设置或错误**

   ```bash
   # .env.local
   NEXTAUTH_URL=http://localhost:3000  # 本地开发
   NEXTAUTH_URL=https://yourdomain.com  # 生产环境
   ```
2. **OAuth 回调 URL 配置错误**

   - 检查 Google/Facebook 控制台中的 **Redirect URI**
   - 必须包含: `https://yourdomain.com/api/auth/callback/google`
3. **查看浏览器控制台错误信息**

   - 打开 F12 Developer Tools
   - 查看 Network 标签页中的请求状态码

---

### Q2: Google 登录报错 "redirect_uri_mismatch"?

**解决方案**:

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 进入 **APIs & Services → Credentials**
3. 编辑 OAuth 2.0 Client ID
4. 在 **Authorized redirect URIs** 中添加:

   ```
   http://localhost:3000/api/auth/callback/google   # 开发环境
   https://yourdomain.com/api/auth/callback/google # 生产环境
   ```
5. 保存后等待 **几分钟** 生效 (Google 配置有缓存)

---

### Q3: 如何调整 Session 过期时间?

在 `auth.ts` 中修改配置：

```typescript
NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,  // 30 天 (默认)
    updateAge: 24 * 60 * 60,     // 24 小时内活动自动续期
  },
  // ...其他配置
})
```

#### 常用过期时间配置

| 场景       | maxAge 值               | 说明           |
| ---------- | ----------------------- | -------------- |
| 高安全应用 | 1*60* 60 (1小时)      | 银行、支付系统 |
| 一般应用   | 7*24* 60 * 60 (7天)   | 社交网络、电商 |
| 低安全需求 | 30*24* 60 * 60 (30天) | 博客、资讯站   |

---

### Q4: 如何在生产环境禁用开发模式的硬编码登录?

当前 `CredentialsProvider` 中的账号仅用于**开发测试**。生产环境禁用方法：

**方法 1: 环境变量判断**

```typescript
CredentialsProvider({
  // ...其他配置
  async authorize(credentials) {
    // 仅在开发环境允许硬编码登录
    if (process.env.NODE_ENV === 'development') {
      if (credentials?.email === "admin@nocaped.com" &&
          credentials?.password === "password123") {
        return { id: "1", name: "Admin", email: "admin@example.com" }
      }
    }
  
    // 生产环境: 查询数据库验证
    // const user = await db.user.findUnique({ where: { email: credentials.email } })
    // if (user && verifyPassword(credentials.password, user.password)) {
    //   return user
    // }
  
    return null
  }
})
```

**方法 2: 直接移除 CredentialsProvider**

生产环境的 `auth.ts` 中删除 `CredentialsProvider` 即可。

---

### Q5: 如何添加数据库支持 (持久化用户)?

推荐使用 **Prisma + 数据库**：

#### 安装 Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

#### 定义数据模型 (`prisma/schema.prisma`)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // 密码哈希 (仅 credentials 登录需要)
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String              // "google" | "facebook"
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

#### 适配 authorize 函数

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

CredentialsProvider({
  async authorize(credentials) {
    // 查询数据库中的用户
    const user = await prisma.user.findUnique({
      where: { email: credentials?.email as string }
    })
  
    if (!user || !user.password) {
      return null
    }
  
    // 验证密码 (使用 bcrypt)
    const isPasswordValid = await compare(
      credentials?.password as string,
      user.password
    )
  
    if (!isPasswordValid) {
      return null
    }
  
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image
    }
  }
})
```

---

### Q6: 如何实现角色权限控制?

通过 **JWT Callback** 扩展 Token，再通过 **Session Callback** 传递给前端：

```typescript
NextAuth({
  callbacks: {
    // JWT 回调: 在 token 中添加自定义字段
    async jwt({ token, user }) {
      if (user) {
        // 从数据库查询用户角色
        // const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        // token.role = dbUser.role
      
        // 或者从 user 对象中获取 (如果 authorize 返回了 role)
        token.role = (user as any).role || 'user'
      }
      return token
    },
  
    // Session 回调: 将 token 中的角色传递给 session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string
      }
      return session
    },
  },
})

// 扩展 Session 类型 (全局类型声明)
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      role?: string  // 新增角色字段
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
  
  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string  // JWT 中也添加角色
  }
}
```

#### 使用示例: 基于角色的条件渲染

```typescript
'use client'
import { useSession } from 'next-auth/react'

function AdminPanel() {
  const { data: session } = useSession()
  
  // 仅管理员可见
  if (session?.user?.role !== 'admin') {
    return <div>Access Denied</div>
  }
  
  return <div>Admin Panel Content</div>
}
```

---

## 🚀 生产环境部署注意事项

### Vercel 部署 (推荐)

1. **连接 Git 仓库**

   - 访问 [vercel.com](https://vercel.com)
   - 导入你的 Git 仓库 (GitHub/GitLab/Bitbucket)
2. **配置环境变量**

   在 Vercel 项目 **Settings → Environment Variables** 中添加：

   ```
   AUTH_SECRET=<generated-strong-random-string>
   NEXTAUTH_URL=https://your-domain.vercel.app
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   FACEBOOK_CLIENT_ID=<your-facebook-app-id>
   FACEBOOK_CLIENT_SECRET=<your-facebook-app-secret>
   ```
3. **自动部署**

   - Vercel 会自动检测 Next.js 并优化构建
   - 每次 `git push` 都会触发重新部署

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### ⚠️ 生产环境必检清单

- [ ] `AUTH_SECRET` 使用强随机字符串 (至少 32 字符)
- [ ] `NEXTAUTH_URL` 设置为完整的 **HTTPS** URL
- [ ] OAuth 提供商的重定向 URI 与控制台配置**完全匹配**
- [ ] 移除或禁用开发模式的硬编码登录凭证
- [ ] 数据库连接字符串使用**环境变量**，不硬编码
- [ ] 启用 HTTPS (Let's Encrypt 免费证书)
- [ ] 配置 CORS (如果前后端分离部署)
- [ ] 设置 Cookie 安全属性 (SameSite, Secure, HttpOnly)

---

## 📊 性能优化建议

### 1. 减少 Bundle 大小

```typescript
// auth.ts - 按需导入 Provider
import GoogleProvider from "next-auth/providers/google"
// 只导入你需要的 Provider，不要全部导入
```

### 2. Session 缓存策略

```typescript
NextAuth({
  session: {
    strategy: 'jwt',  // JWT 比 Database session 更快 (无需查库)
  },
})
```

### 3. 图片优化

```tsx
// 用户头像使用 next/image 优化
import Image from 'next/image'

<Image 
  src={session.user?.image} 
  alt="Avatar"
  width={40}
  height={40}
  className="rounded-full"
/>
```

---

## 🎯 总结

通过本文的学习，你已经掌握了：

✅ **Next-Auth v5 的核心概念和配置**
✅ **Google 和 Facebook OAuth 完整集成流程**
✅ **Session 管理的最佳实践 (客户端/服务端)**
✅ **多种路由保护方案及其优缺点**
✅ **生产环境部署的关键注意事项**
✅ **常见问题的排查思路和解决方案**

### 📚 延伸学习资源

- [Next-Auth 官方文档](https://next-auth.js.org/) - 最权威的参考资料
- [OAuth 2.0 规范](https://oauth.net/2/) - 理解 OAuth 协议原理
- [Prisma 文档](https://www.prisma.io/docs) - 数据库 ORM 最佳实践
- [Next.js Security](https://nextjs.org/docs/building-your-application/configuring/security-headers) - 安全头配置

### 🔗 相关项目

本文使用 Next-Auth 实现多方式登录的示例：

- **技术栈**: Next.js 14 + React 18 + TypeScript 5 + Tailwind CSS
- **认证方式**: Google OAuth + Facebook OAuth + Credentials

---

## 💬 交流与反馈

如果你在集成过程中遇到问题，欢迎：

- 在 **GitHub Issues** 提交问题
- 在评论区留言讨论
- 查看项目的 [FAQ 文档](./README.md#常见问题-faq)

**Happy Coding! 🎉**

---

**最后更新**: 2026-10-02
**文档版本**: 1.0.0
**适用版本**: next-auth@5.0.0-beta.21
