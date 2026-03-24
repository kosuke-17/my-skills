# マイグレーションのベストプラクティス

**原則**: 安全でリバーシブルなマイグレーションを書く

マイグレーションは本番データベースに直接影響します。安全で可逆性のあるマイグレーションを書くことで、トラブル時のロールバックを可能にし、デプロイリスクを最小化します。

## チェック観点

- マイグレーションが可逆か
- データマイグレーションとスキーマ変更が分離されているか
- 本番環境でのダウンタイムを引き起こさないか
- インデックスが適切に追加されているか
- 外部キー制約が設定されているか

## 違反例

### 例1: 不可逆なマイグレーション

```ruby
# ❌ 悪い例: changeメソッドで不可逆な操作
class MergeUserNames < ActiveRecord::Migration[7.0]
  def change
    User.find_each do |user|
      user.update!(full_name: "#{user.first_name} #{user.last_name}")
    end
    remove_column :users, :first_name
    remove_column :users, :last_name
  end
end
```

### 例2: データマイグレーションの混在

```ruby
# ❌ 悪い例: スキーマ変更とデータ変更を同じマイグレーションに
class AddStatusToOrders < ActiveRecord::Migration[7.0]
  def change
    add_column :orders, :status, :string, default: "pending"
    add_index :orders, :status

    # データマイグレーションが混在
    Order.where(completed: true).update_all(status: "completed")
    Order.where(cancelled: true).update_all(status: "cancelled")

    remove_column :orders, :completed
    remove_column :orders, :cancelled
  end
end
```

### 例3: ロック時間の長いマイグレーション

```ruby
# ❌ 悪い例: 大きなテーブルにインデックスを追加（テーブルロックが発生）
class AddIndexToLargeTable < ActiveRecord::Migration[7.0]
  def change
    add_index :events, :user_id  # 数百万行のテーブルでロックが長時間続く
  end
end
```

## 改善例

### 例1の改善: up/downで可逆性を確保

```ruby
# ✅ 良い例: up/downを明示的に定義
class AddFullNameToUsers < ActiveRecord::Migration[7.0]
  def up
    add_column :users, :full_name, :string
  end

  def down
    remove_column :users, :full_name
  end
end

# データマイグレーションは別タスクで実行
# lib/tasks/backfill_full_name.rake
```

### 例2の改善: スキーマとデータを分離

```ruby
# ✅ 良い例: ステップ1 - カラム追加
class AddStatusToOrders < ActiveRecord::Migration[7.0]
  def change
    add_column :orders, :status, :string, default: "pending"
    add_index :orders, :status
  end
end

# ステップ2 - データ移行（Rakeタスクまたは別マイグレーション）
# rake backfill:order_status

# ステップ3 - 古いカラムを削除（データ移行完了後）
class RemoveOldStatusColumnsFromOrders < ActiveRecord::Migration[7.0]
  def change
    remove_column :orders, :completed, :boolean
    remove_column :orders, :cancelled, :boolean
  end
end
```

### 例3の改善: 安全なインデックス追加

```ruby
# ✅ 良い例: CONCURRENTLY オプションでロックを回避（PostgreSQL）
class AddIndexToLargeTable < ActiveRecord::Migration[7.0]
  disable_ddl_transaction!

  def change
    add_index :events, :user_id, algorithm: :concurrently
  end
end
```

## よくある違反パターン

### 1. カラム削除前のignored_columnsの未設定

```ruby
# ❌ 悪い例: カラムをいきなり削除
class RemoveOldColumnFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :legacy_field  # デプロイ中にエラーが発生する可能性
  end
end

# ✅ 良い例: 2段階で削除
# ステップ1: モデルでignored_columnsを設定してデプロイ
class User < ApplicationRecord
  self.ignored_columns += ["legacy_field"]
end

# ステップ2: 次のデプロイでカラムを削除
class RemoveOldColumnFromUsers < ActiveRecord::Migration[7.0]
  def change
    remove_column :users, :legacy_field
  end
end
```

### 2. NOT NULL制約の安全でない追加

```ruby
# ❌ 悪い例: 既存データがある状態でNOT NULLを追加
class AddNotNullToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :role, :string, null: false  # 既存行でエラー
  end
end

# ✅ 良い例: デフォルト値付きで追加、または段階的に
class AddRoleToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :role, :string, default: "member", null: false
  end
end
```

### 3. 外部キー制約の欠如

```ruby
# ❌ 悪い例: 参照整合性が保証されない
create_table :comments do |t|
  t.integer :post_id
  t.text :body
  t.timestamps
end

# ✅ 良い例: 外部キー制約を設定
create_table :comments do |t|
  t.references :post, null: false, foreign_key: true
  t.text :body
  t.timestamps
end
```

## コードレビュー時のチェックポイント

1. **可逆性**: `change`メソッドで自動的にロールバック可能か、または`up`/`down`が定義されているか
2. **データ分離**: スキーマ変更とデータ変更が別のマイグレーションになっているか
3. **インデックス**: 外部キーや検索カラムにインデックスが追加されているか
4. **ロック時間**: 大きなテーブルへの操作で`algorithm: :concurrently`が使われているか
5. **NOT NULL**: 既存データとの互換性が確保されているか
6. **strong_migrations**: `strong_migrations` gem の導入を検討しているか

## 注意点

- `change`メソッドは多くの操作で自動的にロールバックを生成するが、すべてではない
- 本番環境で大きなテーブルを変更する際は、メンテナンスウィンドウの検討も必要
- `strong_migrations` gem は危険なマイグレーションを自動的に検出してくれる
- カラム名の変更は`rename_column`を使い、新カラム追加+データ移行+旧カラム削除の手順は避けるべき場面もある
