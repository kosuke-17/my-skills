# 技術スタック定義

> このファイルを更新することで、環境構築スキル全体の技術選定を変更できる。
> 各ツールの `command` がセットアップ時に実行されるコマンド。

## パッケージマネージャー

- **name**: pnpm
- **check**: `pnpm -v`
- **note**: グローバルにインストール済みであることを前提とする。未インストールの場合はユーザーに案内する

## フレームワーク

- **name**: Next.js (App Router)
- **command**: `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
- **note**: プロジェクトルートに展開。Tailwind CSS・ESLint・TypeScript を同時にセットアップする

## 言語

- **name**: TypeScript
- **note**: Next.js の `--typescript` フラグでセットアップ済み。strict mode を有効にする

## リンター

- **name**: ESLint
- **note**: Next.js の `--eslint` フラグでセットアップ済み
- **additional_packages**:
  - `eslint-config-prettier` — Prettier との競合ルールを無効化

## フォーマッター

- **name**: Prettier
- **command**: `pnpm add -D prettier eslint-config-prettier`
- **config**: `.prettierrc` を作成

## CSS

- **name**: Tailwind CSS
- **note**: Next.js の `--tailwind` フラグでセットアップ済み

## テスト

- **name**: Vitest
- **command**: `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`
- **config**: `vitest.config.ts` を作成
- **scripts**: `"test": "vitest", "test:ci": "vitest run"`

## Storybook

- **name**: Storybook
- **command**: `pnpm dlx storybook@latest init --skip-install && pnpm install`
- **note**: `--skip-install` で初期化後に pnpm で依存をインストール

## Chromatic

- **name**: Chromatic
- **command**: `pnpm add -D chromatic`
- **scripts**: `"chromatic": "chromatic --exit-zero-on-changes"`
- **note**: `CHROMATIC_PROJECT_TOKEN` 環境変数の設定が必要
