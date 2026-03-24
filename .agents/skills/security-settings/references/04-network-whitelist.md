# ネットワークのホワイトリスト設定

## なぜ必要か

プロンプトインジェクション攻撃では、悪意あるコードがClaude Codeを操って
**外部サーバーにデータを送信しようとする**ケースがある。
ネットワークをホワイトリスト方式で制限することで、許可外ドメインへの通信をブロックできる。

---

## チェック方法

設定ファイルのサンドボックス内ネットワーク設定を確認する：

```json
{
  "sandbox": {
    "network": {
      "allowedDomains": [
        "github.com",
        "api.github.com",
        "registry.npmjs.org",
        "pypi.org",
        "files.pythonhosted.org"
      ]
    }
  }
}
```

チーム向けManaged Settingsの場合：

```json
{
  "allowManagedDomainsOnly": true
}
```

### 判定基準

| 状態 | 判定 |
|------|------|
| `sandbox.network.allowedDomains` が設定されている | 🟢 設定済み |
| サンドボックスは有効だがネットワーク制限がない | 🟡 部分的 |
| サンドボックス自体が無効 | 🔴 未設定 |

---

## 推奨設定（プロジェクトに応じてカスタマイズ）

### JavaScript/TypeScript プロジェクト

```json
{
  "sandbox": {
    "network": {
      "allowedDomains": [
        "github.com",
        "api.github.com",
        "registry.npmjs.org",
        "cdn.jsdelivr.net"
      ]
    }
  }
}
```

### Python プロジェクト

```json
{
  "sandbox": {
    "network": {
      "allowedDomains": [
        "github.com",
        "api.github.com",
        "pypi.org",
        "files.pythonhosted.org"
      ]
    }
  }
}
```

---

## よくある落とし穴

- サンドボックスを有効にしても、ネットワーク制限を設定しないと外部への通信は自由にできる
- 許可ドメインは **業務で実際に必要なもの** に絞る。広すぎると意味がない
- サブドメインは別途許可が必要な場合がある（例：`github.com` だけでは `api.github.com` が弾かれることがある）
- Managed Settingsの `allowManagedDomainsOnly: true` は管理者が指定したドメインのみに限定する強力な設定

---

## 注意

ネットワーク制限はサンドボックスが前提。
サンドボックスが無効（`sandbox.enabled: false`）の場合、ネットワーク設定も機能しない。
まず [01-sandbox.md](01-sandbox.md) の設定を確認すること。
