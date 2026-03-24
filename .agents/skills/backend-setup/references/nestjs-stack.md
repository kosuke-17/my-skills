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
  ├── database/
  │   └── database.module.ts # データベースモジュール
  └── modules/               # 機能モジュール格納先
      └── .gitkeep
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
- **command**: `pnpm add @nestjs/typeorm typeorm pg @nestjs/config`
- **config**: `src/database/database.module.ts` に TypeORM の設定を作成する
- **config_content**:
  ```typescript
  import { Module } from '@nestjs/common';
  import { TypeOrmModule } from '@nestjs/typeorm';
  import { ConfigModule, ConfigService } from '@nestjs/config';

  @Module({
    imports: [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_DATABASE', 'app'),
          autoLoadEntities: true,
          synchronize: false,
        }),
      }),
    ],
  })
  export class DatabaseModule {}
  ```
- **migration**:
  - `pnpm add -D ts-node` をインストールする
  - `package.json` に TypeORM CLI 用スクリプトを追加: `"typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js"`
  - `src/database/data-source.ts` に DataSource 設定ファイルを作成する
- **note**: 接続情報は環境変数から `@nestjs/config` の `ConfigService` 経由で取得する

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
  RUN pnpm install --frozen-lockfile

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
        - DB_HOST=db
        - DB_PORT=5432
        - DB_USERNAME=postgres
        - DB_PASSWORD=postgres
        - DB_DATABASE=app
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
