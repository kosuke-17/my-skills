# 機密ファイルへのアクセスブロック

## なぜ必要か

プロンプトインジェクション攻撃では、悪意あるコードにAIへの指示が埋め込まれており、
Claude Codeが意図せず機密ファイルを読もうとする可能性がある。
**読み取り自体をブロック**しておくことで、攻撃が成立しなくなる。

ブロックには2種類のアプローチがあり、**両方を設定するのが確実**。

| アプローチ | 対象 | 設定箇所 |
|-----------|------|----------|
| `permissions.deny` | Claude Codeの「Read」ツール経由のアクセス | `permissions.deny` |
| `sandbox.filesystem.denyRead` | Bashコマンド経由（`cat`、`less` 等）のアクセス | `sandbox.filesystem.denyRead` |

---

## チェック方法

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(**/*.pem)",
      "Read(**/*.key)"
    ]
  },
  "sandbox": {
    "filesystem": {
      "denyRead": ["~/.aws/credentials", "~/.ssh"]
    }
  }
}
```

### 判定基準

| 状態 | 判定 |
|------|------|
| `permissions.deny` と `sandbox.filesystem.denyRead` の両方で機密パスがブロックされている | 🟢 設定済み |
| どちらか一方のみ設定されている | 🟡 部分的 |
| どちらも設定されていない | 🔴 未設定 |

---

## 推奨ブロックリスト

### `permissions.deny`（Readツール経由をブロック）

```json
"deny": [
  "Read(./.env)",
  "Read(./.env.*)",
  "Read(**/*.pem)",
  "Read(**/*.key)",
  "Read(**/*.p12)",
  "Read(**/*.pfx)"
]
```

### `sandbox.filesystem.denyRead`（Bashコマンド経由をブロック）

```json
"denyRead": [
  "~/.aws/credentials",
  "~/.aws/config",
  "~/.ssh",
  "~/.gnupg"
]
```

---

## ブロックすべきファイルの種類

| ファイル/ディレクトリ | 含まれる情報 |
|----------------------|-------------|
| `.env`, `.env.*` | APIキー、DBパスワード、シークレット |
| `*.pem`, `*.key`, `*.p12`, `*.pfx` | SSL証明書、秘密鍵 |
| `~/.aws/credentials` | AWSアクセスキー |
| `~/.ssh/` | SSHプライベートキー |
| `~/.gnupg/` | GPG秘密鍵 |

---

## よくある落とし穴

- `permissions.deny` でReadをブロックしても、`cat .env` などのBashコマンドでは読めてしまう
- `sandbox.filesystem.denyRead` だけ設定しても、サンドボックスを無効にされると効かない
- `.env.local`、`.env.production` など `.env.*` のバリエーションを全てカバーする必要がある
