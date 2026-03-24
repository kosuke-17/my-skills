# Stack: TypeScript + Hono

Hono + @hono/node-server を使用した最小構成の REST API サーバー。

---

## ファイル一覧

```
{project_name}/
├── package.json
├── tsconfig.json
└── src/
    └── index.ts
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
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "hono": "^4",
    "@hono/node-server": "^1"
  },
  "devDependencies": {
    "@types/node": "^22",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## ソースファイル

### src/index.ts

```typescript
import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ message: "Hello World" });
});

const port = 3001;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
```

---

## コマンド

```bash
# 依存インストール
npm install

# 開発サーバー起動（ホットリロード付き）
npm run dev

# ビルド
npm run build

# プロダクション起動
npm start
```

---

## 期待結果

```bash
curl http://localhost:3001
```

レスポンス:
```json
{"message":"Hello World"}
```
