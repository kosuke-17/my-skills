# Phase 3: Docker 環境構築

Docker でアプリケーションをコンテナ化するフェーズ。Phase 0 で Docker が要求された場合のみ実行する。

---

## Next.js 用 Dockerfile

```dockerfile
FROM node:22-slim AS base

# 依存インストール
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 実行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

> **注意:** Next.js で standalone 出力を使うため、`next.config.ts` に `output: "standalone"` を追加する必要がある。Phase 3 実行時に next.config.ts を更新すること。

### next.config.ts の更新（Docker用）

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

---

## Hono 用 Dockerfile

```dockerfile
FROM node:22-slim AS base

# 依存インストール
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ビルド
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 実行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

---

## .dockerignore

全スタック共通:

```dockerignore
node_modules/
.next/
dist/
.git/
.gitignore
*.md
.env.local
```

---

## docker-compose.yml

### 単一サービス（frontend or API）

```yaml
services:
  app:
    build: .
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=production
```

### フルスタック（Next.js + Hono）

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_URL=http://api:3001
    depends_on:
      - api

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
```

---

## 確認手順

```bash
# ビルド
docker compose build

# 起動
docker compose up -d

# ログ確認
docker compose logs -f
```

---

## 完了条件

- [ ] Dockerfile が作成されている（各サービスごと）
- [ ] docker-compose.yml が作成されている
- [ ] .dockerignore が作成されている
- [ ] `docker compose build` が成功する
