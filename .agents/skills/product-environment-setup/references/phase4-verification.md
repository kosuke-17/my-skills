# Phase 4: 動作確認 & 完了

アプリケーションの動作を確認し、セットアップを完了するフェーズ。

---

## ローカル実行での確認

### Next.js

```bash
npm run dev
```

確認:
```bash
curl http://localhost:3000
```

**期待結果:** HTML が返却される（ページが表示される）

### Hono

```bash
npm run dev
```

確認:
```bash
curl http://localhost:3001
```

**期待結果:** `{"message":"Hello World"}` が返却される

### フルスタック（Next.js + Hono 複数サービス）

```bash
# ターミナル1
cd frontend && npm run dev

# ターミナル2
cd api && npm run dev
```

確認:
```bash
curl http://localhost:3000   # フロントエンド
curl http://localhost:3001   # API
```

---

## Docker 実行での確認

```bash
docker compose up -d
```

確認:
```bash
# Next.js
curl http://localhost:3000

# Hono
curl http://localhost:3001
```

停止:
```bash
docker compose down
```

---

## 完了サマリーテンプレート

セットアップ完了後、以下の形式でサマリーを提示する:

```
## セットアップ完了

### プロジェクト情報
- プロジェクト名: {project_name}
- 種別: {type}
- フレームワーク: {framework}

### 作成されたファイル
{ファイル一覧をツリー形式で表示}

### 起動方法

**ローカル実行:**
{起動コマンド}

**Docker実行:**（Dockerありの場合）
{docker compose コマンド}

### アクセス先
- {URL一覧}
```

---

## 完了条件

- [ ] アプリケーションが起動し、正常なレスポンスを返す
- [ ] 完了サマリーをユーザーに提示済み
- [ ] ユーザーが動作確認を完了
