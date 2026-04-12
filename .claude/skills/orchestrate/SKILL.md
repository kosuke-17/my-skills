---
name: orchestrate
description: CDD開発パイプライン全体を指揮するオーケストレーター。plan → impl → eval → fix のサイクルをユーザー確認を挟みながら段階的に進行する。「機能を作りたい」「コンポーネントを実装して」「画面を一通り作って」「plan〜evalまで通して」など、CDD開発の全工程を一気通貫で進めたい場合に使用する。個別のステップだけ実行したい場合は /plan, /impl, /eval, /fix を直接使う。
argument-hint: <feature or component description>
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "TodoWrite", "Task", "Skill", "mcp__storybook-mcp__list-all-documentation", "mcp__storybook-mcp__get-documentation", "mcp__storybook-mcp__get-storybook-story-instructions", "mcp__storybook-mcp__preview-stories", "mcp__storybook-mcp__run-story-tests"]
---

# CDD Orchestrator

feature やコンポーネントの説明を受け取り、CDD 開発パイプライン全体（plan → impl → eval → fix）をユーザーと対話しながら段階的に進行する。

各ステップの完了後にユーザーの承認を得てから次のステップへ進むことで、手戻りを最小化しつつ開発を一気通貫で完了させる。

## Pipeline Overview

```
[Plan] → 確認 → [Impl] → 確認 → [Eval] → 確認 → (FAIL? → [Fix] → [Eval]) × 最大3回 → 完了
```

## Workflow

### Step 1: Plan — 設計

`/plan` スキルを実行して CDD 実装プランを生成する。

引数として `$ARGUMENTS` をそのまま渡す。

**完了後のユーザー確認:**

プランファイルのパスと要約（コンポーネント一覧・実装順序）を提示し、以下を確認する：

- コンポーネント分割は妥当か
- 不足しているコンポーネントや過剰な分割はないか
- 実装の優先順位に問題はないか

ユーザーが修正を求めた場合はプランファイルを編集してから次へ進む。

**進行条件:** ユーザーが「OK」「進めて」等の承認を返すこと。

---

### Step 2: Impl — 実装

`/impl` スキルを実行する。Step 1 で生成されたプランファイルのパスを引数として渡す。

**完了後のユーザー確認:**

実装した内容の要約を提示する：

- 作成/変更したファイル一覧
- 各コンポーネントの実装状況（静的UI / Story / テスト / 動的UI）
- 気になった点や判断に迷った箇所があれば共有

**進行条件:** ユーザーが承認すること。ユーザーから修正指示があればここで対応する。

---

### Step 3: Eval — 品質評価

`/eval` スキルを実行する。

**完了後のユーザー確認:**

評価レポートのパスと結果サマリを提示する：

- 各チェック（TypeScript / ESLint / Jest / Storybook）の結果
- Overall Verdict（PASS or FAIL）
- FAIL の場合は検出された問題の一覧

**分岐:**

- **PASS の場合** → ユーザーに完了を報告し、次のアクション（コミット等）を提案する。Step 5 へ。
- **FAIL の場合** → 検出された問題を提示し、修正サイクルに入ってよいかユーザーに確認する。承認されたら Step 4 へ。

---

### Step 4: Fix-Eval Loop — 修正サイクル（最大3回）

FAIL 時に `/fix` → `/eval` のサイクルを最大3回繰り返す。

各ループで：

1. `/fix` スキルを実行して問題を修正
2. `/eval` スキルを実行して再評価
3. 結果をユーザーに報告

**ループごとのユーザー確認:**

- **PASS になった場合** → 完了を報告。Step 5 へ。
- **FAIL が続く場合** → 残りの問題と修正内容を提示し、次のループに進むか確認する。

**3回修正しても FAIL の場合:**

自動修正の限界に達した旨を報告し、残っている問題の詳細とユーザーへの推奨アクションを提示する。ユーザーが手動修正した後に `/eval` を実行するよう案内する。

---

### Step 5: Completion — 完了

全チェックが PASS したら以下を提示する：

- パイプライン全体のサマリ（作成コンポーネント数、修正ループ回数など）
- 生成されたファイル一覧
- 推奨する次のアクション（コミット、PR 作成など）

---

## Progress Tracking

パイプラインの進行状況を TodoWrite で管理する。以下のタスクを登録し、各ステップ完了時に更新する：

1. `[ ] Plan: 設計プラン作成`
2. `[ ] Plan: ユーザー承認`
3. `[ ] Impl: コンポーネント実装`
4. `[ ] Impl: ユーザー承認`
5. `[ ] Eval: 品質評価`
6. `[ ] Eval: ユーザー承認`
7. `[ ] Fix-Eval Loop (if needed)`
8. `[ ] Completion: 完了報告`

## Error Handling

- いずれかのスキルが失敗した場合、エラー内容をユーザーに報告し、続行するかどうかを確認する
- ユーザーがパイプラインを途中で中断したい場合は、現在の状態を報告して終了する
- 中断した場合でも、生成済みのプランファイルや評価レポートはそのまま残るので、個別のスキル（`/impl`, `/eval` 等）で途中から再開可能
