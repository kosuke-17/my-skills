---
name: product-environment-setup
description: プロダクト開発環境を最小構成でセットアップするワークフロースキル。ユーザーが「環境構築したい」「プロジェクト作りたい」「API作りたい」「フロントエンド作りたい」「Docker環境欲しい」「新しいアプリ作って」「セットアップして」などプロジェクト初期セットアップに関わるリクエストをした際に使用する。TypeScript（Next.js / Hono）に対応し、フロントエンド・API・フルスタック・Docker環境を最小限の構成で即座に動作する状態まで構築する。
---

# Product Environment Setup

プロダクト開発環境を **最小構成（Hello World レベル）** でセットアップする5フェーズのワークフロー。

## 基本原則

- **MINIMAL**: 動作に必要な最小限のファイルのみ作成する。ESLint・Prettier・テスト等は含めない
- **即動作**: セットアップ完了後、すぐに画面表示 or APIレスポンスが確認できる
- **再現性**: 同じ手順で誰でも同じ結果が得られる

---

## 対応スタック

| 種別 | フレームワーク | 用途 | デフォルトポート |
|------|-------------|------|--------------|
| フロントエンド / フルスタック | Next.js (App Router) | 画面表示・API Routes | 3000 |
| API サーバー | Hono (@hono/node-server) | 軽量REST API | 3001 |

### フルスタック構成

- **単一プロジェクト**: Next.js の API Routes で frontend + API を統合
- **複数サービス**: Next.js(frontend) + Hono(API) を docker-compose で接続
- **異言語組合せ**: Next.js(frontend) + 任意言語API を docker-compose で接続（将来対応のスタック追加で拡張可能）

> 将来 Python(FastAPI)・Go・Rust 等を追加する場合は `references/stack-*.md` を追加するだけで拡張できる設計。

---

## ワークフロー全体像

```
Phase 0: 要件ヒアリング（種別・フレームワーク・Docker要否）
Phase 1: プロジェクト初期化（ディレクトリ・設定ファイル）
Phase 2: 最小ファイル実装（Hello World が動く最小構成）
Phase 3: Docker 環境構築（要求された場合のみ）
Phase 4: 動作確認 & 完了
```

各フェーズの詳細手順は `references/` に格納。SKILL.md ではフェーズ概要とゲート条件を定義する。

---

## フェーズ制御ルール

1. **必ず Phase 0 から開始する。** ユーザーが明確に指定していても、確認のためにPhase 0の質問を実施する。
2. **各フェーズのゲート条件をすべて満たしてから次フェーズへ進む。**
3. **ユーザーに各フェーズの完了を明示的に伝え、次フェーズへ進む許可を取る。**
4. **Phase 3 は Docker を要求された場合のみ実行する。** 要求がなければスキップ。
5. **途中フェーズからの開始を要求された場合は、** 先行フェーズの成果物を確認してから着手する。

---

## Phase 0: 要件ヒアリング

**詳細:** [phase0-requirements.md](references/phase0-requirements.md)

ユーザーに以下を確認する:
- プロジェクト名
- 種別（frontend / API / fullstack）
- フレームワーク選択
- Docker 要否
- ポート番号（変更希望があれば）

**ゲート条件:**
- [ ] プロジェクト名が決定している
- [ ] 種別とフレームワークが確定している
- [ ] Docker 要否が確定している

---

## Phase 1: プロジェクト初期化

**詳細:** [phase1-project-init.md](references/phase1-project-init.md)

- プロジェクトディレクトリ作成
- git init + .gitignore
- package.json / tsconfig.json 生成

**ゲート条件:**
- [ ] プロジェクトディレクトリが存在する
- [ ] .gitignore が作成されている
- [ ] パッケージマネージャの設定ファイルが存在する

---

## Phase 2: 最小ファイル実装

**詳細:** [phase2-implementation.md](references/phase2-implementation.md)

- 選択したスタックの `stack-*.md` に基づいてファイル作成
- 依存パッケージのインストール

**ゲート条件:**
- [ ] stack-*.md に記載された全ファイルが作成済み
- [ ] `npm install` が正常完了

---

## Phase 3: Docker 環境構築（条件付き）

**詳細:** [phase3-docker.md](references/phase3-docker.md)

- Dockerfile 作成
- docker-compose.yml 作成（フルスタックの場合は複数サービス定義）
- .dockerignore 作成

**ゲート条件:**
- [ ] Dockerfile が作成されている
- [ ] docker-compose.yml が作成されている
- [ ] `docker compose build` が成功する

---

## Phase 4: 動作確認 & 完了

**詳細:** [phase4-verification.md](references/phase4-verification.md)

- アプリケーション起動
- レスポンス確認（curl or ブラウザ）
- 作成ファイル一覧と起動方法のサマリー提示

**ゲート条件:**
- [ ] アプリケーションが正常にレスポンスを返す
- [ ] ユーザーにサマリーを提示済み

---

## スタック参照ファイル

| スタック | 参照ファイル |
|---------|------------|
| Next.js (App Router) | [stack-typescript-nextjs.md](references/stack-typescript-nextjs.md) |
| Hono | [stack-typescript-hono.md](references/stack-typescript-hono.md) |
