---
name: frontend-setup
description: フロントエンドプロジェクトの環境構築を行うスキル。「フロントエンドの環境構築して」「フロントエンドプロジェクトをセットアップして」「新しいフロントエンドプロジェクトを作りたい」「フロントエンドの開発環境を整えて」などのリクエスト時に使用する。技術スタックは決めうちで、references/stack.md に定義されている。
---

# 環境構築スキル

決めうちの技術スタックでプロジェクトの開発環境を構築する。

## 技術スタック

技術スタックの詳細は `references/stack.md` を参照すること。

> **技術スタックを変更・更新したい場合は `references/stack.md` を編集する。**

### 採用技術一覧

| カテゴリ               | 技術                   |
| ---------------------- | ---------------------- |
| パッケージマネージャー | pnpm                   |
| フレームワーク         | Next.js (App Router)   |
| 言語                   | TypeScript (strict)    |
| リンター               | ESLint                 |
| フォーマッター         | Prettier               |
| CSS                    | Tailwind CSS           |
| テスト                 | Vitest                 |
| コンポーネントカタログ | Storybook              |
| ビジュアルテスト       | Chromatic              |

---

## セットアップフロー

**必ず `references/stack.md` を読んでから実行すること。** コマンドやオプションは stack.md の定義に従う。

### Phase 1: 事前確認

1-1. 対象ディレクトリが空であること（または新規作成先）を確認する
1-2. Node.js がインストールされていることを確認する（`node -v`）
1-3. プロジェクト名をユーザーに確認する

### Phase 2: プロジェクト作成

2-1. pnpm がインストールされていることを確認する（stack.md の `パッケージマネージャー.check` を実行）。未インストールならユーザーに案内して停止する
2-2. Next.js プロジェクトを作成する（stack.md の `フレームワーク.command` を実行）
2-3. TypeScript の `strict: true` を `tsconfig.json` で確認する

### Phase 3: フォーマッター・リンター設定

3-1. Prettier と関連パッケージをインストールする（stack.md の `フォーマッター.command` を実行）
3-2. `.prettierrc` を作成する
3-3. ESLint 設定に `prettier` を追加して競合を解消する

### Phase 4: テスト環境

4-1. Vitest と関連パッケージをインストールする（stack.md の `テスト.command` を実行）
4-2. `vitest.config.ts` を作成する
4-3. `package.json` にテスト用スクリプトを追加する

### Phase 5: Storybook & Chromatic

5-1. Storybook を初期化する（stack.md の `Storybook.command` を実行）
5-2. Chromatic をインストールする（stack.md の `Chromatic.command` を実行）
5-3. `package.json` に chromatic スクリプトを追加する

### Phase 6: 最終確認

6-1. `pnpm install` で依存関係が正常にインストールされることを確認
6-2. `pnpm build` でビルドが通ることを確認
6-3. `pnpm test:ci` でテストが実行可能なことを確認
6-4. セットアップ結果のサマリーをユーザーに提示する

---

## フロー制御ルール

1. **必ず Phase 1 から順に実行する。** フェーズをスキップしない。
2. **各コマンドの実行結果を確認してから次へ進む。** エラーが出た場合はその場で対処する。
3. **部分実行にも対応する。** ユーザーが「テスト環境だけ追加して」と言った場合は、該当フェーズだけを実行する。
4. **コマンドは stack.md の定義に従う。** stack.md に書かれていないコマンドを勝手に追加しない。
