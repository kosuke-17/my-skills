# Phase 0: 要件ヒアリング

ユーザーの要件を明確にし、セットアップ対象を確定するフェーズ。

---

## ヒアリング項目

### 1. プロジェクト名

```
プロジェクト名を教えてください（例: my-app, todo-api）
```

- 英小文字・ハイフン区切りを推奨
- 未指定の場合は `my-app` をデフォルトとする

### 2. プロジェクト種別

```
どの種類のプロジェクトを作りますか？

1. frontend  - 画面表示があるWebアプリ
2. api       - REST APIサーバー
3. fullstack - 画面 + API の両方
```

### 3. フレームワーク選択

種別に応じて提案する:

| 種別 | 選択肢 | デフォルト |
|------|-------|----------|
| frontend | Next.js | Next.js |
| api | Hono / Next.js API Routes | Hono |
| fullstack（単一） | Next.js (API Routes統合) | Next.js |
| fullstack（複数サービス） | Next.js + Hono | Next.js + Hono |

**判定フロー:**
- frontend → Next.js 一択
- api → Hono を推奨（軽量・高速）。ただしNext.jsプロジェクト内のAPIなら API Routes
- fullstack → 「1つのプロジェクトで完結させたいか、サービスを分けたいか？」を確認
  - 1つ → Next.js（API Routes統合）
  - 分ける → Next.js(frontend) + Hono(api) の2サービス構成

### 4. Docker 要否

```
Docker環境は必要ですか？（docker-compose でコンテナ上で動かす）

- はい: Dockerfile + docker-compose.yml を作成
- いいえ: ローカル実行のみ（npm run dev）
```

### 5. ポート番号

```
デフォルトのポート番号:
- Next.js: 3000
- Hono: 3001

変更が必要であれば指定してください。
```

---

## 出力フォーマット

ヒアリング完了後、以下の形式で確認を取る:

```
## セットアップ内容の確認

| 項目 | 値 |
|------|-----|
| プロジェクト名 | {project_name} |
| 種別 | {type} |
| フレームワーク | {framework} |
| Docker | {yes/no} |
| ポート | {port} |

この内容でセットアップを開始してよろしいですか？
```

---

## 完了条件

- [ ] 全ヒアリング項目がユーザーに確認済み
- [ ] セットアップ内容の確認表をユーザーに提示済み
- [ ] ユーザーが確認表を承認済み
