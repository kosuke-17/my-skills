---
name: security-settings
description: Claude Codeのセキュリティ設定が適切に行われているかを診断するスキル。「セキュリティ設定を確認して」「security settingsをチェックして」「Claude Codeの設定を見直したい」「サンドボックスが有効か確認して」などのリクエストに使用する。プロジェクトおよびグローバルの設定ファイルを読み込み、7つのセキュリティ項目を評価して診断レポートを出力する。
---

# Claude Code セキュリティ設定チェック

Claude Codeの設定ファイルを読み込み、**7つのセキュリティ項目**を評価して診断レポートを出力する。

## チェックの進め方

### Step 1: 設定ファイルの読み込み

以下の優先順位で設定ファイルを探して読み込む：

1. プロジェクトの設定: `.claude/settings.json`（カレントディレクトリ起点）
2. プロジェクトのローカル設定: `.claude/settings.local.json`
3. ユーザーグローバル設定: `~/.claude/settings.json`（`/root/.claude/settings.json` または `/home/<user>/.claude/settings.json`）

> ファイルが存在しない場合は「未設定」として評価する。

### Step 2: 7項目の評価

各項目について、対応する参照ファイルを読んで評価基準を確認してから判定する。

| # | 項目 | 参照ファイル | 重要度 |
|---|------|------------|--------|
| 1 | サンドボックスの有効化と完全閉鎖 | [01-sandbox.md](references/01-sandbox.md) | 🔴 最重要 |
| 2 | denyルールによる危険コマンドのブロック | [02-deny-rules.md](references/02-deny-rules.md) | 🔴 最重要 |
| 3 | 機密ファイルへのアクセスブロック | [03-sensitive-files.md](references/03-sensitive-files.md) | 🔴 最重要 |
| 4 | ネットワークのホワイトリスト設定 | [04-network-whitelist.md](references/04-network-whitelist.md) | 🟡 推奨 |
| 5 | PreToolUseフックによる安全チェック | [05-hooks.md](references/05-hooks.md) | 🟡 推奨 |
| 6 | /permissionsによる定期棚卸し | [06-permissions-audit.md](references/06-permissions-audit.md) | 🟡 推奨 |
| 7 | チーム向けManaged Settings | [07-managed-settings.md](references/07-managed-settings.md) | 🔵 チーム向け |

### Step 3: 診断レポートの出力

以下のフォーマットで結果を出力する。

---

## 診断レポートフォーマット

```
## Claude Code セキュリティ診断レポート

### 読み込んだ設定ファイル
- [読み込めたファイルパスを列挙。なければ「なし（デフォルト設定のみ）」]

---

### チェック結果

| # | 項目 | 状態 | 詳細 |
|---|------|------|------|
| 1 | サンドボックス | 🟢/🟡/🔴 | ... |
| 2 | denyルール | 🟢/🟡/🔴 | ... |
| 3 | 機密ファイルブロック | 🟢/🟡/🔴 | ... |
| 4 | ネットワーク制限 | 🟢/🟡/🔴 | ... |
| 5 | PreToolUseフック | 🟢/🟡/🔴 | ... |
| 6 | 権限の棚卸し | 🟢/🟡/🔴 | ... |
| 7 | Managed Settings | 🟢/🟡/🔴/➖ | ... |

---

### 優先して対応すべき項目

[🔴の項目があれば優先度順に具体的な設定例を提示する]

### 推奨対応項目

[🟡の項目があれば改善案を提示する]

### 総合評価

[全体的なセキュリティレベルのコメント]
```

---

## 判定基準

- 🟢 **設定済み**: 項目が適切に設定されており、安全と判断できる
- 🟡 **部分的**: 設定はあるが不完全、または改善の余地がある
- 🔴 **未設定/危険**: 設定がなく、リスクが高い状態
- ➖ **対象外**: 個人利用では不要（Managed Settingsなど）

---

## チェックリスト（簡易版）

各項目の詳細は参照ファイルを参照すること。

- [ ] **[1] サンドボックス**: `sandbox.enabled: true` かつ `allowUnsandboxedCommands: false`
- [ ] **[2] denyルール**: `git push --force`、`rm -rf *`、`curl *`、`wget *` 等がdenyに含まれる
- [ ] **[3] 機密ファイル**: `.env`、`*.pem`、`*.key`、`~/.ssh`、`~/.aws/credentials` がブロックされている
- [ ] **[4] ネットワーク**: サンドボックスのネットワーク設定でドメインが制限されている
- [ ] **[5] フック**: PreToolUseフックで危険なコマンドパターンの検証スクリプトが設定されている
- [ ] **[6] 棚卸し**: 不要なallowルールが蓄積していないか定期確認している
- [ ] **[7] チーム設定**: チーム利用の場合、Managed Settingsで組織ポリシーが強制されている

---

## 参照ファイル一覧

| 項目 | ファイル |
|------|--------|
| 1. サンドボックス | [references/01-sandbox.md](references/01-sandbox.md) |
| 2. denyルール | [references/02-deny-rules.md](references/02-deny-rules.md) |
| 3. 機密ファイルブロック | [references/03-sensitive-files.md](references/03-sensitive-files.md) |
| 4. ネットワーク制限 | [references/04-network-whitelist.md](references/04-network-whitelist.md) |
| 5. PreToolUseフック | [references/05-hooks.md](references/05-hooks.md) |
| 6. 権限の棚卸し | [references/06-permissions-audit.md](references/06-permissions-audit.md) |
| 7. Managed Settings | [references/07-managed-settings.md](references/07-managed-settings.md) |
