# Stack: TypeScript + Next.js (App Router)

Next.js 15 App Router を使用した最小構成のフロントエンド / フルスタックプロジェクト。

---

## ファイル一覧

### 基本構成（frontend）

```
{project_name}/
├── package.json
├── tsconfig.json
├── next.config.ts
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
└── public/
```

### フルスタック追加ファイル

```
app/
└── api/
    └── hello/
        └── route.ts
```

---

## 初期化ファイル

### package.json

```json
{
  "name": "{project_name}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

> Docker 使用時は `output: "standalone"` を追加する（Phase 3 参照）。

---

## ソースファイル

### app/globals.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

main {
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

p {
  color: #666;
}
```

### app/layout.tsx

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "{project_name}",
  description: "{project_name}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

### app/page.tsx

```tsx
export default function Home() {
  return (
    <main>
      <h1>{project_name}</h1>
      <p>環境構築が完了しました</p>
    </main>
  );
}
```

### app/api/hello/route.ts（フルスタックの場合のみ）

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}
```

---

## コマンド

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プロダクション起動
npm start
```

---

## 期待結果

- **フロントエンド:** `http://localhost:3000` にアクセスするとページが表示される
- **API（フルスタック時）:** `curl http://localhost:3000/api/hello` で `{"message":"Hello World"}` が返却される
