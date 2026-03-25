# 技術スタック定義（NestJS）

> このファイルを更新することで、環境構築スキル全体の技術選定を変更できる。
> 各ツールの `command` がセットアップ時に実行されるコマンド。

## パッケージマネージャー

- **name**: pnpm
- **check**: `pnpm -v`
- **init_command**: なし（NestJS CLI がプロジェクト生成時に初期化する）
- **note**: グローバルにインストール済みであることを前提とする。未インストールの場合はユーザーに案内する

## フレームワーク

- **name**: NestJS
- **command**: `pnpm dlx @nestjs/cli new <project-name> --package-manager pnpm --strict`
- **note**: `--strict` で TypeScript strict mode を有効化。プロジェクトディレクトリが新規作成される
- **structure**:
  ```
  src/
  ├── main.ts                # エントリーポイント
  ├── app.module.ts          # ルートモジュール
  ├── app.controller.ts      # ルートコントローラー
  ├── app.service.ts         # ルートサービス
  ├── config/
  │   └── configuration.ts   # 環境変数・設定管理
  ├── prisma/
  │   ├── prisma.service.ts  # PrismaClient ラッパー（OnModuleInit）
  │   └── prisma.module.ts   # グローバル Prisma モジュール
  └── modules/               # 機能モジュール格納先
      └── .gitkeep
  ```
  プロジェクトルートには以下も生成される（`npx prisma init` による）:
  ```
  prisma/
  └── schema.prisma          # Prisma スキーマ定義
  ```
- **entrypoint**: `src/main.ts` に NestFactory.create でアプリケーションを起動する

## 言語

- **name**: TypeScript
- **note**: NestJS CLI の `--strict` フラグでセットアップ済み。`tsconfig.json` の `strict: true` を確認する

## リンター・フォーマッター

- **name**: ESLint + Prettier（NestJS 標準）
- **command**: なし（NestJS CLI がセットアップ済み）
- **note**: NestJS CLI が ESLint・Prettier を自動設定する。必要に応じてルールをカスタマイズする
- **config**: `.eslintrc.js` と `.prettierrc` が自動生成される
- **scripts**: `"lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix", "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\""`

## データベース

- **name**: PostgreSQL
- **orm**: Prisma
- **command**: `pnpm add @prisma/client @nestjs/config` と `pnpm add -D prisma`
- **init**: `npx prisma init` でプロジェクトルートに `prisma/schema.prisma` と `.env` が生成される
- **schema**:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- **env**: `.env` に `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app?schema=public"` を設定する
- **config**: `src/prisma/prisma.service.ts` に PrismaClient のラッパーを作成する
- **config_content**:
  ```typescript
  import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
  import { PrismaClient } from '@prisma/client';

  @Injectable()
  export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
  {
    async onModuleInit() {
      await this.$connect();
    }

    async onModuleDestroy() {
      await this.$disconnect();
    }
  }
  ```
- **module_content**: `src/prisma/prisma.module.ts` にグローバルモジュールを作成する
  ```typescript
  import { Global, Module } from '@nestjs/common';
  import { PrismaService } from './prisma.service';

  @Global()
  @Module({
    providers: [PrismaService],
    exports: [PrismaService],
  })
  export class PrismaModule {}
  ```
- **app_module_note**: `app.module.ts` の `imports` に `PrismaModule` と `ConfigModule.forRoot()` を追加する
- **migration**:
  - マイグレーション作成: `npx prisma migrate dev --name <migration-name>`
  - マイグレーション適用（本番）: `npx prisma migrate deploy`
  - クライアント再生成: `npx prisma generate`
  - DB リセット（開発用）: `npx prisma migrate reset`
  - `package.json` に以下のスクリプトを追加:
    ```json
    "prisma:migrate": "prisma migrate dev",
    "prisma:deploy": "prisma migrate deploy",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset"
    ```
- **note**: 接続情報は `DATABASE_URL` 環境変数で管理する。`@nestjs/config` の `ConfigModule` はアプリケーション設定用に併用する

## テスト

- **name**: Jest（NestJS 標準）
- **command**: なし（NestJS CLI がセットアップ済み）
- **note**: NestJS CLI が Jest を自動設定する。`@nestjs/testing` の `Test.createTestingModule` でユニットテストを作成する
- **config**: `jest` 設定は `package.json` 内に自動生成される
- **structure**:
  ```
  src/
  ├── app.controller.spec.ts  # 自動生成されるユニットテスト
  test/
  ├── app.e2e-spec.ts          # 自動生成される E2E テスト
  └── jest-e2e.json            # E2E テスト設定
  ```
- **scripts**: `"test": "jest", "test:ci": "jest --ci", "test:e2e": "jest --config ./test/jest-e2e.json"`

## Docker

- **dockerfile**:
  ```dockerfile
  FROM node:22-slim AS base
  RUN corepack enable && corepack prepare pnpm@latest --activate

  FROM base AS deps
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  COPY prisma ./prisma/
  RUN pnpm install --frozen-lockfile
  RUN pnpm prisma generate

  FROM base AS build
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY . .
  RUN pnpm build

  FROM base AS production
  WORKDIR /app
  COPY --from=deps /app/node_modules ./node_modules
  COPY --from=build /app/dist ./dist
  COPY package.json ./

  EXPOSE 3000

  CMD ["node", "dist/main"]
  ```
- **compose**:
  ```yaml
  services:
    app:
      build: .
      ports:
        - "3000:3000"
      environment:
        - DATABASE_URL=postgresql://postgres:postgres@db:5432/app?schema=public
      depends_on:
        db:
          condition: service_healthy

    db:
      image: postgres:17
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: app
      volumes:
        - postgres_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U postgres"]
        interval: 5s
        timeout: 5s
        retries: 5

  volumes:
    postgres_data:
  ```
- **dockerignore**:
  ```
  node_modules
  dist
  .git
  .env
  ```
