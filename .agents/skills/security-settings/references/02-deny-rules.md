# denyルール - 危険なコマンドのブロック

## なぜ必要か

Claude Codeのパーミッション評価の優先順位は **deny → ask → allow** の順。
`deny` は最優先で処理され、セッション中に「Always allow」を連打しても、`deny` に入っているコマンドは絶対に実行されない。

---

## チェック方法

設定ファイルの `permissions.deny` 配列を確認する：

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(git push --force *)",
      "Bash(chmod 777 *)"
    ]
  }
}
```

### 判定基準

| 状態 | 判定 |
|------|------|
| `permissions.deny` に最低限の危険コマンドが含まれている | 🟢 設定済み |
| `permissions.deny` は存在するが、`git push --force` や `rm -rf` などが抜けている | 🟡 部分的 |
| `permissions.deny` キーがない | 🔴 未設定 |

---

## 最低限含めるべきdenyルール

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git push -f *)",
      "Bash(git reset --hard *)",
      "Bash(curl *)",
      "Bash(wget *)",
      "Bash(chmod 777 *)"
    ]
  }
}
```

### 各ルールの理由

| ルール | 理由 |
|--------|------|
| `rm -rf *` | ファイルの大量削除。取り返しがつかない |
| `git push --force *` | リモートの履歴を強制上書き。チームに影響が出る |
| `git push -f *` | `--force` の短縮形も忘れずに |
| `git reset --hard *` | コミット前の変更を全消し。取り返しがつかない |
| `curl *` | 外部へのデータ送信リスク（公式もデフォルトブロック推奨） |
| `wget *` | 同上 |
| `chmod 777 *` | 全員に書き込み権限を付与。セキュリティホール |

---

## よくある落とし穴

- `curl *` と `wget *` は公式ドキュメントでもブロック推奨だが、明示的に設定していないと環境によっては有効にならない
- `git push --force` だけ書いて `git push -f` を忘れるパターン
- `deny` ルールはプロジェクト設定 > ユーザー設定の順で適用されるが、`deny` 同士は両方が評価される（どちらかにあればブロックされる）
