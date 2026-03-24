# 技術スタック定義（React + Vitest）

> このファイルを更新することで、環境構築スキル全体の技術選定を変更できる。
> 各ツールの `command` がセットアップ時に実行されるコマンド。

## パッケージマネージャー

- **name**: pnpm
- **check**: `pnpm -v`
- **note**: グローバルにインストール済みであることを前提とする。未インストールの場合はユーザーに案内する

## フレームワーク

- **name**: Vite + React
- **command**: `pnpm create vite@latest . --template react-ts`
- **note**: プロジェクトルートに展開。TypeScript テンプレートを使用する

## 言語

- **name**: TypeScript
- **note**: Vite の `react-ts` テンプレートでセットアップ済み。`tsconfig.json` で `strict: true` を確認する

## リンター

- **name**: ESLint
- **command**: `pnpm add -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier`
- **config**: `eslint.config.js` を作成

## フォーマッター

- **name**: Prettier
- **command**: `pnpm add -D prettier eslint-config-prettier`
- **config**: `.prettierrc` を作成

## CSS

- **name**: Tailwind CSS
- **command**: `pnpm add -D tailwindcss @tailwindcss/vite`
- **note**: `vite.config.ts` に `@tailwindcss/vite` プラグインを追加し、`src/index.css` に `@import "tailwindcss"` を追記する

## テスト

- **name**: Vitest
- **command**: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- **config**: `vite.config.ts` の `test` フィールドに設定を追加（environment: 'jsdom'）
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
