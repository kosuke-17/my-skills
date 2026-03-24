# PreToolUseフック - 独自の安全チェック

## なぜ必要か

`deny` ルールは静的なパターンマッチングのため、複雑な条件（「本番環境への接続を含むコマンドはブロック」等）には対応できない。
**PreToolUseフック**を使うと、コマンド実行前にカスタムスクリプトを挟んで独自の検証ロジックを実装できる。

---

## チェック方法

設定ファイルの `hooks.PreToolUse` を確認する：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": ".claude/hooks/validate-command.sh"
        }]
      }
    ]
  }
}
```

### 判定基準

| 状態 | 判定 |
|------|------|
| `hooks.PreToolUse` にBashコマンド検証スクリプトが設定されている | 🟢 設定済み |
| フックは設定されているが、セキュリティ用途のものではない | 🟡 部分的 |
| `hooks` キー自体がない | 🔴 未設定 |

> セキュリティ用フックがなくても、項目1〜4が設定されていれば基本的な安全性は確保できる。
> フックは「中〜上級者向け」の追加対策。

---

## フックスクリプトの例

`.claude/hooks/validate-command.sh`

```bash
#!/bin/bash
# PreToolUseフックでBashコマンドの危険パターンを検出する
# exit 0: 許可  exit 2: ブロック

COMMAND=$(echo "$CLAUDE_TOOL_INPUT" | jq -r '.command // empty')

# 本番環境へのDB接続を含むコマンドをブロック
if echo "$COMMAND" | grep -qE 'prod|production' && echo "$COMMAND" | grep -qE 'mysql|psql|mongo'; then
  echo "本番データベースへの接続はブロックされています" >&2
  exit 2
fi

# 環境変数に秘密情報を含むコマンドをブロック
if echo "$COMMAND" | grep -qE 'AWS_SECRET|PRIVATE_KEY|PASSWORD'; then
  echo "秘密情報を含むコマンドはブロックされています" >&2
  exit 2
fi

exit 0
```

---

## フックの種類

Claude Codeで使えるフックのタイプ：

| タイプ | 説明 |
|--------|------|
| `command` | ローカルのシェルスクリプトを実行 |
| `http` | HTTPウェブフックを呼び出す |
| `llm` | LLMにプロンプトで評価させる |
| `agent` | エージェント型の検証を行う |

---

## フックのexit codeの意味

| exit code | 動作 |
|-----------|------|
| `0` | コマンドを許可して実行 |
| `2` | コマンドをブロック（Claude Codeに通知） |
| その他 | エラーとして扱われる |

---

## フックを使うべきユースケース

- 本番環境への操作を検知してブロックしたい
- 特定のファイルパターンへの変更を検知したい
- チーム固有のルール（命名規則、ブランチ制約など）を強制したい
- 監査ログを外部システムに送りたい

---

## よくある落とし穴

- スクリプトに実行権限がない（`chmod +x .claude/hooks/validate-command.sh` が必要）
- `jq` がインストールされていないと `CLAUDE_TOOL_INPUT` のパースが失敗する
- フックの実行時間が長いとClaude Codeの応答が遅くなる
- `exit 2` 以外のコードを返すとフックが「失敗」扱いになり意図しない動作をする場合がある
