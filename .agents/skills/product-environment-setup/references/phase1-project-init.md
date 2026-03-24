# Phase 1: プロジェクト初期化

プロジェクトのディレクトリ構造と基本設定ファイルを作成するフェーズ。

---

## 手順

### 1. プロジェクトディレクトリ作成

```bash
mkdir {project_name}
cd {project_name}
```

### 2. Git 初期化

```bash
git init
```

### 3. .gitignore 作成

Node.js / TypeScript 向けの最小 .gitignore:

```gitignore
node_modules/
dist/
.next/
*.tgz
.env
.env.local
```

### 4. パッケージマネージャ初期化

選択したスタックの `stack-*.md` を参照して、package.json と tsconfig.json を作成する。

- **Next.js** → [stack-typescript-nextjs.md](stack-typescript-nextjs.md) の「初期化ファイル」セクション
- **Hono** → [stack-typescript-hono.md](stack-typescript-hono.md) の「初期化ファイル」セクション
- **フルスタック（複数サービス）** → モノレポ構成にする:

```
{project_name}/
├── frontend/    # Next.js
├── api/         # Hono
├── docker-compose.yml  (Phase 3で作成)
└── .gitignore
```

フルスタック（複数サービス）の場合は、各サブディレクトリで個別に初期化する。

---

## 完了条件

- [ ] プロジェクトディレクトリが存在する
- [ ] `git init` 済み
- [ ] .gitignore が作成されている
- [ ] package.json が存在する（複数サービスの場合は各サブディレクトリに）
- [ ] tsconfig.json が存在する（複数サービスの場合は各サブディレクトリに）
