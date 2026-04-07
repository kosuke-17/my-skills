---
name: eval
description: CDD実装品質を評価する（成果物評価）。TypeScript型チェック、ESLint、Jestテスト、Storybookビルドを実行し、CDD準拠を検証して構造化レポートを出力する。/impl後、または品質検証が必要な時に使用。
allowed-tools: ["Bash", "Read", "Write", "Glob", "Grep", "TodoWrite", "mcp__storybook-mcp__run-story-tests", "mcp__storybook-mcp__preview-stories", "mcp__storybook-mcp__list-all-documentation"]
---

# CDD品質評価（成果物評価）

実装されたコンポーネントを複数の品質観点から評価し、レポートを生成する。これは成果物レベルの評価であり、自律性の品質は自律性レビュースキルで別途評価する。

## プランファイルの確認

最新のプランファイル: !`ls -t .claude/plans/*.plan.md 2>/dev/null | head -1 || echo "なし"`

プランファイルが存在する場合は、読み込んで対象コンポーネントを特定する。

---

## 評価ワークフロー

各チェックをTodoWriteで追跡する。

### チェック1: TypeScript型チェック

```bash
pnpm tsc --noEmit 2>&1
```

確認ポイント:

- 型エラーがゼロであること
- `any` 型を使用していないこと
- strictモードに準拠していること

### チェック2: ESLint

```bash
pnpm lint 2>&1
```

確認ポイント:

- ESLintエラーがゼロであること
- boolean命名規則（is/has/can）に準拠していること

### チェック3: Jestテスト

```bash
pnpm test --passWithNoTests 2>&1
```

確認ポイント:

- 全テストが通ること
- 対象コンポーネントのテストが存在すること

### チェック4: Storybookストーリーテスト（MCP経由）

フルビルドの代わりにStorybook MCPを使用して、より高速で詳細な検証を行う。

1. `mcp__storybook-mcp__list-all-documentation` を `withStoryIds: true` で呼び出し、対象コンポーネントのストーリーの存在を確認
2. `mcp__storybook-mcp__run-story-tests` を対象コンポーネントのストーリーに対して（`a11y: true` で）呼び出し、コンポーネントテストとアクセシビリティテストを実行
3. `mcp__storybook-mcp__preview-stories` を対象ストーリーに対して呼び出し、レンダリングを確認

確認ポイント:

- 全対象コンポーネントにストーリーが存在すること
- 全ストーリーテストが通ること（コンポーネント + a11y）
- ストーリーが正しくレンダリングされること

フォールバック: Storybookが起動していない場合は `pnpm storybook build --test 2>&1` を使用

### チェック5: CDD準拠レビュー

自動チェックに加えて、対象コンポーネントのソースコードを読み、以下を確認する:

| 観点 | 確認内容 |
| --------------- | ------------------------------------------------- |
| 静的UI | propsのみでUIが完成している（不要なstateがない） |
| ロジック分離 | ロジックがカスタムフックに分離されている |
| ストーリー品質 | 全バリエーションがカバーされている |
| テスト品質 | Arrange-Act-Assert構造が使われている |
| アクセシビリティ | ロールベースのクエリが使われている |

---

## レポート出力

全チェック完了後、レポートを生成する。

- **出力先**: `.claude/plans/`
- **ファイル名**: `YYYY-MM-DD-HHMMSS-{識別子}.eval.md`

### レポート構成

以下の構造で出力する:

**見出し**: `# 評価レポート: {機能名}`

**セクション構成:**

1. **サマリー** — 各チェック（TypeScript / ESLint / Jest / Storybook）の結果（合格/不合格）とエラー数のテーブル
2. **総合判定** — `PASS` または `FAIL`。全チェック合格時のみPASS
3. **検出された問題**（FAIL時のみ） — 各問題について:
   - カテゴリ（TypeScript / ESLint / Jest / Storybook / CDD準拠）
   - ファイルパス:行番号
   - 問題の詳細
   - 推奨される修正方法
4. **CDD準拠チェック** — コンポーネントごとの静的UI / ストーリー / テスト / フック分離の状態テーブル
5. **次のアクション** — FAILの場合は `/fix` を実行、PASSの場合は自律性レビュー（任意）またはコミットに進む

---

## 判定基準

### PASS条件

全て満たすこと:

- TypeScript: エラーゼロ
- ESLint: エラーゼロ（警告は許容）
- Jest: 全テスト合格
- Storybook: ビルド成功
- CDD準拠: 全コンポーネントが規約に適合

### FAIL条件

上記のいずれかを満たしていない場合。

## 次のステップ

- **PASS**: 実装完了。自律性レビュー（任意）またはコミット/プッシュに進む。
- **FAIL**: `/fix` コマンドで検出された問題を修正する。
