# サンドボックス設定 - 有効化と完全閉鎖

## なぜ必要か

サンドボックスはClaude Codeが実行するBashコマンドをOSレベルで隔離する機能。
- macOS: **Seatbelt** を使用
- Linux: **Bubble Wrap** を使用

サンドボックスを有効にするだけでは不十分。`dangerouslyDisableSandbox` パラメータを使うと回避できてしまう。
**「有効化」と「脱出口を完全に塞ぐ」は別の操作。**

---

## チェック方法

設定ファイルの以下のキーを確認する：

```json
{
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false
  }
}
```

### 判定基準

| 状態 | 判定 |
|------|------|
| `sandbox.enabled: true` かつ `allowUnsandboxedCommands: false` | 🟢 設定済み |
| `sandbox.enabled: true` のみ（`allowUnsandboxedCommands` が未設定またはtrue） | 🟡 部分的（脱出口あり） |
| `sandbox` キー自体がない、または `enabled: false` | 🔴 未設定 |

---

## 推奨設定

```json
{
  "sandbox": {
    "enabled": true,
    "allowUnsandboxedCommands": false
  }
}
```

---

## よくある落とし穴

- `sandbox: { "enabled": true }` だけで安心してしまう
  → `allowUnsandboxedCommands` のデフォルト値がtrueのため、脱出口が開いたまま
- サンドボックスが効かないことで、任意のBashコマンドがホスト環境に直接影響を与えられる
- プロンプトインジェクション攻撃でClaude Codeが悪意あるコマンドを実行するリスクが残る

---

## /sandboxコマンドで確認

Claude Codeの `/sandbox` コマンドで現在のサンドボックス状態を確認できる。
