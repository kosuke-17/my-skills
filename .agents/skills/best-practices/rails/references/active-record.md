# ActiveRecordのベストプラクティス

**原則**: ActiveRecordを正しく使い、効率的で保守しやすいデータアクセスを実現する

ActiveRecordはRailsの強力なORMですが、誤った使い方はパフォーマンス問題やバグの原因となります。

## チェック観点

- N+1クエリが発生していないか
- スコープが適切に活用されているか
- コールバックが乱用されていないか
- バリデーションが適切な場所に配置されているか
- 大量データの処理が効率的か
- `default_scope`を使用していないか

## 違反例

### 例1: N+1クエリ

```ruby
# ❌ 悪い例: N+1クエリが発生する
def index
  @posts = Post.all
end

# ビューで
# @posts.each do |post|
#   post.author.name  # 投稿ごとにクエリが発行される
#   post.comments.count
# end
```

### 例2: コールバックの乱用

```ruby
# ❌ 悪い例: コールバックに副作用のあるロジックを詰め込む
class Order < ApplicationRecord
  after_create :send_confirmation_email
  after_create :notify_slack
  after_create :update_inventory
  after_create :calculate_commission
  after_create :sync_to_external_api

  private

  def send_confirmation_email
    OrderMailer.confirmation(self).deliver_now
  end

  def notify_slack
    SlackNotifier.new.notify("新規注文: #{id}")
  end

  def update_inventory
    items.each { |item| item.product.decrement!(:stock, item.quantity) }
  end

  def calculate_commission
    # 複雑な手数料計算...
  end

  def sync_to_external_api
    ExternalApi.sync_order(self)
  end
end
```

### 例3: default_scopeの使用

```ruby
# ❌ 悪い例: default_scopeは予期しない動作を引き起こす
class Article < ApplicationRecord
  default_scope { where(published: true) }
  # Article.all は常に published: true のみ返す
  # Article.count も published: true のみカウント
  # unscoped を使わないと全件取得できない
end
```

## 改善例

### 例1の改善: Eager Loadingの活用

```ruby
# ✅ 良い例: includesでN+1を解消
def index
  @posts = Post.includes(:author, :comments).all
end

# preloadとeager_loadの使い分け
# preload: 別クエリで読み込み（デフォルト推奨）
Post.preload(:author)

# eager_load: LEFT OUTER JOINで読み込み（関連テーブルで絞り込む場合）
Post.eager_load(:author).where(authors: { active: true })

# includes: Railsが自動判定（通常はpreloadと同じ）
Post.includes(:author)
```

### 例2の改善: コールバックを最小限にしてサービスに委譲

```ruby
# ✅ 良い例: コールバックは最小限、副作用はサービスに委譲
class Order < ApplicationRecord
  # コールバックはデータ整合性に関するもののみ
  before_validation :set_order_number, on: :create

  private

  def set_order_number
    self.order_number = SecureRandom.hex(8)
  end
end

# 副作用のあるロジックはサービスで管理
class OrderCreationService
  def call(order_params)
    order = Order.create!(order_params)
    OrderMailer.confirmation(order).deliver_later
    SlackNotifier.new.notify("新規注文: #{order.id}")
    InventoryService.new.update(order)
    order
  end
end
```

### 例3の改善: 名前付きスコープを使用

```ruby
# ✅ 良い例: 名前付きスコープで意図を明確にする
class Article < ApplicationRecord
  scope :published, -> { where(published: true) }
  scope :draft, -> { where(published: false) }
  scope :recent, -> { order(created_at: :desc) }
end

# 呼び出し側で意図が明確
Article.published        # 公開記事のみ
Article.draft            # 下書きのみ
Article.all              # 全件（意図通り）
```

## よくある違反パターン

### 1. クエリメソッドの非効率な使用

```ruby
# ❌ 悪い例: 全レコードをメモリに読み込んでからフィルタ
users = User.all.select { |u| u.age >= 18 }
count = User.all.length

# ✅ 良い例: データベースレベルでフィルタ
users = User.where("age >= ?", 18)
count = User.count
```

### 2. 大量データの一括処理

```ruby
# ❌ 悪い例: 全レコードを一度にメモリに読み込む
User.all.each do |user|
  user.update(status: :inactive)
end

# ✅ 良い例: バッチ処理で分割
User.find_each(batch_size: 1000) do |user|
  user.update(status: :inactive)
end

# さらに良い例: 一括更新
User.update_all(status: :inactive)
```

### 3. 存在確認の非効率なメソッド

```ruby
# ❌ 悪い例
User.where(email: email).count > 0
User.where(email: email).length > 0
User.where(email: email).present?

# ✅ 良い例
User.exists?(email: email)
User.where(email: email).exists?
```

## コードレビュー時のチェックポイント

1. **N+1クエリ**: ループ内で関連データにアクセスしていないか
2. **スコープ**: 再利用可能なクエリ条件がスコープとして定義されているか
3. **コールバック**: コールバックはデータ整合性のみに使われているか
4. **バッチ処理**: 大量データの処理に`find_each`/`in_batches`を使っているか
5. **クエリ効率**: `pluck`、`select`、`exists?`等を適切に使い分けているか
6. **default_scope**: 使用されていないか（使用は原則禁止）

## 注意点

- `includes`は万能ではない。不要な関連まで読み込むとメモリを圧迫する
- スコープの連鎖が長くなりすぎる場合はQuery Objectの導入を検討する
- コールバックを全て排除する必要はない。データの整合性を保つための`before_validation`等は適切な使用
- `update_all`はコールバックとバリデーションをスキップするため、使用には注意が必要
