# パフォーマンスのベストプラクティス

**原則**: 不要なクエリや処理を避け、スケーラブルなアプリケーションを構築する

パフォーマンスの問題は小規模では見えにくく、データ量やユーザー数の増加とともに顕在化します。最初から効率的なコードを書くことが重要です。

## チェック観点

- 不要なクエリが発行されていないか
- インデックスが適切に設定されているか
- キャッシュが有効活用されているか
- 重い処理がバックグラウンドジョブに移されているか
- メモリ効率の良いメソッドを使っているか

## 違反例

### 例1: 非効率なデータ取得

```ruby
# ❌ 悪い例: 不要なデータをメモリに読み込む
user_names = User.all.map(&:name)
active_count = User.all.select(&:active?).count
user_emails = User.where(active: true).map { |u| u.email }
```

### 例2: カウンターキャッシュの未使用

```ruby
# ❌ 悪い例: 関連レコードを毎回カウント
class Post < ApplicationRecord
  has_many :comments
end

# ビューで毎回カウントクエリが発行される
# @posts.each do |post|
#   post.comments.count  # SELECT COUNT(*) FROM comments WHERE post_id = ?
# end
```

### 例3: 同期的な重い処理

```ruby
# ❌ 悪い例: リクエスト内で重い処理を実行
def create
  @report = Report.create!(report_params)
  @report.generate_pdf           # 時間がかかる
  ReportMailer.send(@report).deliver_now  # メール送信も同期
  ExternalApi.sync(@report)      # 外部API呼び出しも同期
  redirect_to @report
end
```

## 改善例

### 例1の改善: 効率的なデータ取得メソッド

```ruby
# ✅ 良い例: データベースレベルで処理
user_names = User.pluck(:name)
active_count = User.where(active: true).count
user_emails = User.where(active: true).pluck(:email)

# 特定のカラムだけ取得
users = User.select(:id, :name, :email).where(active: true)
```

### 例2の改善: カウンターキャッシュの活用

```ruby
# ✅ 良い例: カウンターキャッシュを使用
# マイグレーション
# add_column :posts, :comments_count, :integer, default: 0, null: false

class Comment < ApplicationRecord
  belongs_to :post, counter_cache: true
end

# post.comments_count で追加クエリなしにカウントを取得
```

### 例3の改善: バックグラウンドジョブの活用

```ruby
# ✅ 良い例: 重い処理はバックグラウンドジョブに
def create
  @report = Report.create!(report_params)
  ReportGenerationJob.perform_later(@report.id)
  redirect_to @report, notice: "レポートを生成中です"
end

class ReportGenerationJob < ApplicationJob
  def perform(report_id)
    report = Report.find(report_id)
    report.generate_pdf
    ReportMailer.send(report).deliver_now
    ExternalApi.sync(report)
  end
end
```

## よくある違反パターン

### 1. インデックスの欠如

```ruby
# ❌ 悪い例: 頻繁に検索されるカラムにインデックスがない
# マイグレーションでインデックスを追加し忘れ
create_table :orders do |t|
  t.references :user
  t.string :status
  t.timestamps
end
# Order.where(status: "pending") が遅い

# ✅ 良い例: 検索条件に使うカラムにインデックスを追加
create_table :orders do |t|
  t.references :user, index: true
  t.string :status
  t.timestamps
end
add_index :orders, :status
add_index :orders, [:user_id, :status]  # 複合インデックス
```

### 2. キャッシュの未活用

```ruby
# ❌ 悪い例: 変更頻度の低いデータを毎回クエリ
def sidebar
  @categories = Category.all.order(:name)
  @popular_tags = Tag.popular.limit(20)
end

# ✅ 良い例: フラグメントキャッシュを活用
# ビューで
# <% cache "sidebar", expires_in: 1.hour do %>
#   <% @categories.each do |category| %>
#     ...
#   <% end %>
# <% end %>

# またはロシアンドールキャッシュ
# <% cache @post do %>
#   <% cache @post.author do %>
#     <%= @post.author.name %>
#   <% end %>
# <% end %>
```

### 3. 不要なクエリの発行

```ruby
# ❌ 悪い例: 使わないデータまで取得
@user = User.includes(:posts, :comments, :followers, :following).find(params[:id])
# プロフィールページでは posts しか表示しないのに全部読み込む

# ✅ 良い例: 必要な関連だけ読み込む
@user = User.includes(:posts).find(params[:id])
```

## コードレビュー時のチェックポイント

1. **pluck/select**: `map`で取得できるものを`pluck`や`select`に置き換えられないか
2. **カウンターキャッシュ**: 頻繁にカウントされる関連にカウンターキャッシュがあるか
3. **バックグラウンドジョブ**: メール送信、API呼び出し、PDF生成等が非同期化されているか
4. **インデックス**: WHERE句やORDER句で使われるカラムにインデックスがあるか
5. **キャッシュ**: 変更頻度の低いデータにキャッシュが適用されているか
6. **Bullet gem**: N+1クエリの検出ツールが導入されているか

## 注意点

- 過度な最適化は避ける。まず問題を計測してから最適化する
- キャッシュの無効化（cache invalidation）は複雑になりがち。シンプルに保つ
- `pluck`は ActiveRecord オブジェクトを生成しないため、モデルのメソッドを呼ぶ必要がある場合は`select`を使う
- カウンターキャッシュは`update_all`等で直接更新された場合にずれることがある
