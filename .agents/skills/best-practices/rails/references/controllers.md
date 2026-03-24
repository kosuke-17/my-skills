# コントローラーのベストプラクティス

**原則**: コントローラーは薄く保ち、ビジネスロジックをモデルやサービスに委譲する

コントローラーはHTTPリクエストとレスポンスの橋渡し役に徹するべきです。ビジネスロジックがコントローラーに入り込むと、テストが難しく、再利用性の低いコードになります。

## チェック観点

- コントローラーにビジネスロジックが含まれていないか
- Strong Parametersが適切に使われているか
- before_actionが適切に活用されているか
- RESTful以外のカスタムアクションが多すぎないか
- インスタンス変数が最小限か

## 違反例

### 例1: Fat Controller

```ruby
# ❌ 悪い例: ビジネスロジックがコントローラーに集中
class OrdersController < ApplicationController
  def create
    @order = Order.new(order_params)
    @order.total = 0

    order_params[:items].each do |item_params|
      product = Product.find(item_params[:product_id])
      if product.stock < item_params[:quantity].to_i
        flash[:error] = "#{product.name}の在庫が不足しています"
        render :new and return
      end
      price = product.price * item_params[:quantity].to_i
      if current_user.premium?
        price = price * 0.9
      end
      @order.total += price
      product.update!(stock: product.stock - item_params[:quantity].to_i)
    end

    @order.tax = @order.total * 0.1
    @order.shipping = @order.total > 5000 ? 0 : 500
    @order.grand_total = @order.total + @order.tax + @order.shipping

    if @order.save
      OrderMailer.confirmation(@order).deliver_later
      redirect_to @order, notice: "注文が完了しました"
    else
      render :new
    end
  end
end
```

### 例2: Strong Parametersの不適切な使用

```ruby
# ❌ 悪い例: permit!で全パラメータを許可
def user_params
  params.require(:user).permit!
end

# ❌ 悪い例: パラメータの直接使用
def update
  @user.update(role: params[:role], admin: params[:admin])
end
```

### 例3: before_actionの過剰なスキップ

```ruby
# ❌ 悪い例: skip_before_actionが多い = 設計の問題
class ApiController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_before_action :authenticate_user!
  skip_before_action :set_locale
  skip_before_action :track_activity
end
```

## 改善例

### 例1の改善: サービスオブジェクトに委譲

```ruby
# ✅ 良い例: コントローラーは薄く、ロジックはサービスに委譲
class OrdersController < ApplicationController
  def create
    result = OrderCreationService.new(current_user).call(order_params)

    if result.success?
      redirect_to result.order, notice: "注文が完了しました"
    else
      @order = result.order
      flash.now[:error] = result.error_message
      render :new
    end
  end

  private

  def order_params
    params.require(:order).permit(
      items: [:product_id, :quantity]
    )
  end
end
```

### 例2の改善: Strong Parametersを適切に定義

```ruby
# ✅ 良い例: 許可するパラメータを明示的に指定
def user_params
  params.require(:user).permit(:name, :email, :bio)
end

# 管理者用に別のメソッドを用意
def admin_user_params
  params.require(:user).permit(:name, :email, :bio, :role, :admin)
end
```

### 例3の改善: 適切な継承構造

```ruby
# ✅ 良い例: API用の基底コントローラーを別途用意
class Api::BaseController < ActionController::API
  before_action :authenticate_api_token!

  private

  def authenticate_api_token!
    # API固有の認証ロジック
  end
end

class Api::OrdersController < Api::BaseController
  # skip_before_actionが不要
end
```

## よくある違反パターン

### 1. レスポンスフォーマットの不統一

```ruby
# ❌ 悪い例: レスポンスの形式がバラバラ
def create
  if @item.save
    render json: @item
  else
    render json: @item.errors.full_messages, status: 422
  end
end

# ✅ 良い例: 一貫したレスポンス形式
def create
  if @item.save
    render json: { data: @item }, status: :created
  else
    render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
  end
end
```

### 2. コントローラーでの直接的なクエリ

```ruby
# ❌ 悪い例: 複雑なクエリをコントローラーに直書き
def index
  @users = User.joins(:orders)
               .where("orders.created_at > ?", 30.days.ago)
               .where(active: true)
               .group("users.id")
               .having("COUNT(orders.id) > 5")
               .order("COUNT(orders.id) DESC")
end

# ✅ 良い例: スコープやQuery Objectに委譲
def index
  @users = User.active.frequent_buyers(since: 30.days.ago, min_orders: 5)
end
```

### 3. RESTful以外のアクションの増殖

```ruby
# ❌ 悪い例: カスタムアクションが多すぎる
resources :users do
  member do
    post :activate
    post :deactivate
    post :send_welcome_email
    post :reset_password
    post :export_data
  end
end

# ✅ 良い例: 別のリソースとして切り出す
resources :users
resources :user_activations, only: [:create, :destroy]
resources :user_exports, only: [:create, :show]
```

## コードレビュー時のチェックポイント

1. **アクションの行数**: 1つのアクションが10行を超えていないか
2. **ビジネスロジック**: 条件分岐やループがコントローラーに含まれていないか
3. **Strong Parameters**: `permit!`を使用していないか、必要なパラメータのみ許可しているか
4. **before_action**: 共通処理が適切にbefore_actionで抽出されているか
5. **インスタンス変数**: ビューに渡すインスタンス変数が最小限か
6. **レスポンス**: フォーマットが統一されているか

## 注意点

- 薄いコントローラーを目指すあまり、不要な抽象化を導入しない
- シンプルなCRUD操作はサービスオブジェクトなしでも十分
- before_actionの連鎖が長くなると処理の流れが追いにくくなる
- API用とWeb用でコントローラーの基底クラスを分離することを検討する
