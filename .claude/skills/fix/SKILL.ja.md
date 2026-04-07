---
name: fix
description: /evalで検出された問題を修正する。評価レポートから各問題を優先度付けし、根本原因を分析、修正し、全自動チェック（TypeScript、ESLint、Jest、Storybook）が通るまで再検証する。評価レポートのパスを引数として渡す。省略時は最新の評価レポートを使用。
argument-hint: [評価レポートのパス]
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "TodoWrite", "mcp__storybook-mcp__run-story-tests", "mcp__storybook-mcp__get-storybook-story-instructions", "mcp__storybook-mcp__preview-stories"]
---

# CDD問題修正

評価レポートの問題を修正し、全チェックを通す。

## 評価レポートの読み込み

- 引数あり: `$ARGUMENTS` からパスを読み取る
- 引数なし: 最新の評価レポートを使用

最新の評価レポート: !`ls -t .claude/plans/*.eval.md 2>/dev/null | head -1 || echo ".claude/plans/に評価レポートが見つかりません。先に /eval を実行してください。"`

評価レポートが見つからない場合は、先に `/eval` を実行するようユーザーに案内する。

---

## 修正ワークフロー

### ステップ1: 問題の分類と優先度付け

「検出された問題」セクションの問題を優先度で分類し、TodoWriteに登録する:

| 優先度 | カテゴリ | 理由 |
| -------- | ---------------------- | -------------------------------- |
| 1 | TypeScript型エラー | 連鎖的なエラーを引き起こす可能性がある |
| 2 | ESLintエラー | コード品質の基盤 |
| 3 | Jestテスト失敗 | 機能の正しさ |
| 4 | Storybookビルドエラー | UI検証の基盤 |
| 5 | CDD準拠の問題 | アーキテクチャ品質 |

### ステップ2: 問題の修正

各問題に対して以下のサイクルを実行する:

1. **根本原因分析**: 該当ファイルを読み、根本原因を特定
2. **修正**: 最小限の変更で問題を解決
3. **対象チェックの再実行**: 修正した問題に関連するチェックを再実行

#### TypeScript型エラー

```bash
pnpm tsc --noEmit 2>&1
```

よくある原因と修正:

- propsの型定義が不足 -> 型を追加
- インポートパスの不一致 -> `@/` エイリアスを修正
- strictモード違反 -> null/undefinedチェックを追加

#### ESLintエラー

```bash
# 自動修正を試行
pnpm lint --fix 2>&1
# 残りのエラーを確認
pnpm lint 2>&1
```

よくある原因と修正:

- boolean命名違反 -> `is`/`has`/`can` プレフィックスを追加
- 未使用の変数 -> 削除
- インポート順序 -> Prettierで自動フォーマット

#### Jestテスト失敗

```bash
pnpm test -- --testPathPattern="{component-name}" 2>&1
```

よくある原因と修正:

- コンポーネント変更後にテストが更新されていない -> テストを更新
- モックの不一致 -> モックを修正
- 非同期待機が不十分 -> `waitFor` / `findBy*` を使用

#### Storybookストーリーエラー

Storybook MCPを使用してより高速なフィードバックを得る:

1. `mcp__storybook-mcp__get-storybook-story-instructions` を呼び出して正しいストーリーの規約を確認
2. ストーリーファイルを修正
3. `mcp__storybook-mcp__run-story-tests` を特定のストーリーに対して呼び出し、修正を検証
4. `mcp__storybook-mcp__preview-stories` でレンダリングを確認

フォールバック: `pnpm storybook build --test 2>&1`

よくある原因と修正:

- インポートエラー -> パスを修正
- args/propsの型不一致 -> ストーリーの型を修正
- CSF形式の問題 -> Meta/StoryObjの定義を確認

#### CDD準拠の問題

- 不要なstate -> propsまたは派生値に変換
- コンポーネント内のロジック -> カスタムフックに抽出
- ストーリーバリエーションの不足 -> ストーリーを追加

### ステップ3: 全チェックの再実行

全問題の修正後、全チェックを再実行する:

```bash
pnpm tsc --noEmit 2>&1
pnpm lint 2>&1
pnpm test --passWithNoTests 2>&1
pnpm storybook build --test 2>&1
```

### ステップ4: 結果の確認

- **全チェック通過**: 修正完了。ユーザーに報告。
- **未解決の問題あり**: ステップ2に戻り、残りの問題を修正。
- **3回以上のループ**: 状況をユーザーに報告し、アプローチを相談する。

---

## 修正の原則

- **最小限の変更**: 問題の修正に必要な変更のみ行う
- **新しい問題を作らない**: 修正が他の部分に影響しないことを確認
- **CDD原則を維持**: 修正がCDDアーキテクチャを壊さないことを確認

## 次のステップ

- **全チェック通過**: 最終確認のため `/eval` を再実行するか、コミットに進む。
- **問題が未解決**: 状況をユーザーに報告し、アプローチを相談する。
