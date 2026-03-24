# チーム向けManaged Settings - 組織ポリシーの強制

## なぜ必要か

個人利用では `settings.json` を自分で管理できるが、チームでは各メンバーが異なる設定を持つリスクがある。
**Managed Settings** を使うと、管理者が設定したポリシーをチーム全員に強制できる。

---

## チェック方法

組織の管理者視点でのチェック項目：

```json
{
  "permissions": {
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true,
  "allowManagedHooksOnly": true,
  "allowManagedMcpServersOnly": true
}
```

### 判定基準

| 状態 | 判定 |
|------|------|
| 個人利用 | ➖ 対象外 |
| チーム利用かつManaged Settingsが設定されている | 🟢 設定済み |
| チーム利用だがManaged Settingsが設定されていない | 🔴 未設定 |

---

## 2種類の配布方式

### 1. Server-managed settings（Public Beta）

- Claude.aiの管理コンソールから設定を配信
- MDM（モバイルデバイス管理）不要
- リモートワーク環境でも有効
- 設定変更が即時反映される

### 2. Endpoint-managed settings

- JamfやIntuneなどのMDMでデバイスに直接配置
- セキュリティ重視の組織向け
- 管理者がデバイスを物理的または仮想的に管理している場合に向いている

---

## 主要な設定キーの説明

| キー | 説明 |
|------|------|
| `disableBypassPermissionsMode: "disable"` | `bypassPermissions` モードを無効化する。ユーザーがセキュリティを全開にするモードを使えなくなる |
| `allowManagedPermissionRulesOnly: true` | ユーザーが独自に設定したallow/denyルールを全て無効化。管理者設定のみが有効 |
| `allowManagedHooksOnly: true` | 管理者が許可したフックのみ実行可能。ユーザーが独自フックを追加できなくなる |
| `allowManagedMcpServersOnly: true` | 管理者が許可したMCPサーバーのみ使用可能。勝手なサードパーティMCPの追加を防ぐ |

---

## 推奨設定（チーム管理者向け）

```json
{
  "permissions": {
    "disableBypassPermissionsMode": "disable",
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Bash(git push -f *)",
      "Bash(git reset --hard *)",
      "Bash(curl *)",
      "Bash(wget *)"
    ]
  },
  "allowManagedPermissionRulesOnly": true,
  "allowManagedHooksOnly": true,
  "allowManagedMcpServersOnly": true,
  "allowManagedDomainsOnly": true,
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false
  }
}
```

---

## よくある落とし穴

- `allowManagedPermissionRulesOnly: true` にすると、ユーザーがプロジェクト固有のallowルールを追加できなくなる。柔軟性とセキュリティのバランスに注意
- Managed Settingsの設定は管理者アカウントが正しく権限を持っていないと配信されない
- `disableBypassPermissionsMode` を設定しても、他の脆弱な設定が残っていると意味がない
