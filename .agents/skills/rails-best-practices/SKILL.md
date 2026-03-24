---
name: rails-best-practices
description: Railsコードをベストプラクティスに基づいてレビュー・評価するスキル。ActiveRecord、コントローラー、ルーティング、セキュリティ、パフォーマンス、テスト等の観点からRailsコードの品質を確認する際に使用する。
---

# Railsコードレビュー - ベストプラクティス

Railsコードレビュー時に、ベストプラクティスに基づいてコードを評価します。

## レビュープロセス

1. **変更されたコードを分析**
   - 変更範囲を把握
   - 影響範囲を確認

2. **該当するベストプラクティスファイルを参照**
   - モデル・クエリ・データアクセス → [active-record.md](references/active-record.md)
   - コントローラーの設計 → [controllers.md](references/controllers.md)
   - ルーティング設計 → [routing.md](references/routing.md)
   - セキュリティ対策 → [security.md](references/security.md)
   - パフォーマンス最適化 → [performance.md](references/performance.md)
   - テストの品質 → [testing.md](references/testing.md)
   - ビジネスロジックの整理 → [service-objects.md](references/service-objects.md)
   - マイグレーションの安全性 → [migrations.md](references/migrations.md)
   - 設定・構成の管理 → [configuration.md](references/configuration.md)

3. **ベストプラクティスに基づいて評価**
   - 各観点からコードをチェック
   - 違反パターンを特定
   - 改善提案を検討

4. **フィードバックを提供**

## フィードバックフォーマット

レビュー結果は以下の形式で提供：

- 🔴 **Critical**: マージ前に修正必須（バグ、セキュリティ、重大な設計問題）
- 🟡 **Suggestion**: 改善を推奨（可読性、保守性の向上）
- 🟢 **Nice to have**: 任意の改善（コード品質の微調整）

各フィードバックには：
- 該当するベストプラクティス名
- 問題の説明
- 具体的なコード例（該当箇所）
- 改善案（可能な場合）

## チェックリスト

コードレビュー時に確認する観点：

- [ ] **ActiveRecord**: N+1クエリ、スコープの活用、適切なバリデーション
- [ ] **コントローラー**: 薄いコントローラー、Strong Parameters、RESTfulアクション
- [ ] **ルーティング**: RESTful設計、適切なネスト、名前空間の活用
- [ ] **セキュリティ**: SQLインジェクション、XSS、CSRF、Mass Assignment対策
- [ ] **パフォーマンス**: クエリ最適化、キャッシュ、インデックス、バックグラウンドジョブ
- [ ] **テスト**: 適切な構成、ファクトリ活用、テストの独立性
- [ ] **設計パターン**: Service Object、Form Object等の適切な活用
- [ ] **マイグレーション**: 可逆性、安全なスキーマ変更、データマイグレーション分離
- [ ] **設定**: credentials管理、環境変数、定数の一元管理

## ベストプラクティスファイルの参照

各ベストプラクティスの詳細は、同じディレクトリ内の対応するファイルを参照してください：

- [active-record.md](references/active-record.md) - ActiveRecordのベストプラクティス
- [controllers.md](references/controllers.md) - コントローラーのベストプラクティス
- [routing.md](references/routing.md) - ルーティングのベストプラクティス
- [security.md](references/security.md) - セキュリティのベストプラクティス
- [performance.md](references/performance.md) - パフォーマンスのベストプラクティス
- [testing.md](references/testing.md) - テストのベストプラクティス
- [service-objects.md](references/service-objects.md) - サービスオブジェクトとデザインパターン
- [migrations.md](references/migrations.md) - マイグレーションのベストプラクティス
- [configuration.md](references/configuration.md) - 設定と構成のベストプラクティス
