# Phase 2: 最小ファイル実装

Hello World が動作する最小限のファイルを作成するフェーズ。

---

## 基本原則

- **stack-*.md に記載されたファイルのみ作成する。** 追加ファイルは一切作らない
- **ファイル内容は stack-*.md のコードブロックをそのまま使用する。** カスタマイズはプロジェクト名・ポート番号のみ
- **依存パッケージは stack-*.md に記載されたもののみインストールする**

---

## 手順

### 1. スタック参照ファイルの確認

選択に応じて参照:
- **Next.js** → [stack-typescript-nextjs.md](stack-typescript-nextjs.md)
- **Hono** → [stack-typescript-hono.md](stack-typescript-hono.md)

### 2. ファイル作成

stack-*.md の「ファイル一覧」に記載された全ファイルを作成する。

作成順序:
1. 設定ファイル（package.json, tsconfig.json, next.config.ts 等）
2. ソースファイル（app/, src/ 配下）

### 3. 依存インストール

```bash
npm install
```

### 4. フルスタック（複数サービス）の場合

各サブディレクトリで個別にファイル作成 + npm install を実行:

```bash
# frontend
cd frontend/
# → stack-typescript-nextjs.md に従ってファイル作成
npm install

# api
cd ../api/
# → stack-typescript-hono.md に従ってファイル作成
npm install
```

---

## 完了条件

- [ ] stack-*.md に記載された全ファイルが作成済み
- [ ] `npm install` が正常完了（node_modules が存在する）
- [ ] TypeScript の構文エラーがない
