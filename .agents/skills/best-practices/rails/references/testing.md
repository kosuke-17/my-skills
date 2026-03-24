# テストのベストプラクティス

**原則**: 信頼性が高く保守しやすいテストを書く

良いテストはコードの品質を保証し、リファクタリングを安全にします。悪いテストはメンテナンスコストを増大させます。

## チェック観点

- テストが適切に構成されているか（Arrange-Act-Assert）
- ファクトリが効率的に使われているか
- テスト間の独立性が保たれているか
- モック/スタブが適切に使われているか
- テストの意図が明確か

## 違反例

### 例1: テストの構成が不明確

```ruby
# ❌ 悪い例: 何をテストしているか分かりにくい
RSpec.describe Order do
  it "works" do
    user = User.create!(name: "test", email: "test@example.com", password: "password123")
    product = Product.create!(name: "Widget", price: 1000, stock: 10)
    order = Order.create!(user: user, status: "pending")
    order.items.create!(product: product, quantity: 2)
    order.calculate_total
    expect(order.total).to eq(2000)
    order.apply_discount(10)
    expect(order.total).to eq(1800)
    order.complete!
    expect(order.status).to eq("completed")
    expect(product.reload.stock).to eq(8)
  end
end
```

### 例2: テスト間の依存

```ruby
# ❌ 悪い例: テスト間で状態を共有
RSpec.describe UserService do
  before(:all) do
    @user = User.create!(name: "test", email: "test@example.com")
  end

  it "updates name" do
    @user.update!(name: "updated")
    expect(@user.name).to eq("updated")
  end

  it "has original name" do
    # 前のテストで名前が変更されているため失敗する
    expect(@user.name).to eq("test")
  end
end
```

### 例3: 過度なモック

```ruby
# ❌ 悪い例: 実装の詳細をテストしている
RSpec.describe OrderService do
  it "creates order" do
    user = double("User", id: 1, premium?: true)
    product = double("Product", id: 1, price: 1000, stock: 10)

    expect(Order).to receive(:new).and_return(double("Order", save: true))
    expect(product).to receive(:update!).with(stock: 8)
    expect(OrderMailer).to receive_message_chain(:confirmation, :deliver_later)

    OrderService.new(user).create(product_id: 1, quantity: 2)
  end
end
```

## 改善例

### 例1の改善: 1テスト1アサーション、明確な命名

```ruby
# ✅ 良い例: テストごとに1つの振る舞いを検証
RSpec.describe Order do
  let(:user) { create(:user) }
  let(:product) { create(:product, price: 1000, stock: 10) }
  let(:order) { create(:order, user: user) }

  before do
    create(:order_item, order: order, product: product, quantity: 2)
  end

  describe "#calculate_total" do
    it "商品の合計金額を計算する" do
      order.calculate_total
      expect(order.total).to eq(2000)
    end
  end

  describe "#apply_discount" do
    it "割引率に応じて合計金額を減額する" do
      order.calculate_total
      order.apply_discount(10)
      expect(order.total).to eq(1800)
    end
  end

  describe "#complete!" do
    it "ステータスを完了に変更する" do
      order.complete!
      expect(order.status).to eq("completed")
    end

    it "商品の在庫を減らす" do
      order.complete!
      expect(product.reload.stock).to eq(8)
    end
  end
end
```

### 例2の改善: テストの独立性を確保

```ruby
# ✅ 良い例: 各テストが独立
RSpec.describe UserService do
  let(:user) { create(:user, name: "test") }

  it "updates name" do
    user.update!(name: "updated")
    expect(user.name).to eq("updated")
  end

  it "has original name" do
    expect(user.name).to eq("test")
  end
end
```

### 例3の改善: 適切なレベルでのテスト

```ruby
# ✅ 良い例: 実際のオブジェクトを使い、振る舞いをテスト
RSpec.describe OrderService do
  let(:user) { create(:user, :premium) }
  let(:product) { create(:product, price: 1000, stock: 10) }

  it "注文を作成し在庫を更新する" do
    result = OrderService.new(user).create(product_id: product.id, quantity: 2)

    expect(result).to be_success
    expect(result.order.total).to eq(1800) # プレミアム割引適用
    expect(product.reload.stock).to eq(8)
  end

  it "メール送信をキューに追加する" do
    expect {
      OrderService.new(user).create(product_id: product.id, quantity: 2)
    }.to have_enqueued_mail(OrderMailer, :confirmation)
  end
end
```

## よくある違反パターン

### 1. let!の不必要な使用

```ruby
# ❌ 悪い例: let!で不要なレコードも作成
let!(:user1) { create(:user) }
let!(:user2) { create(:user) }
let!(:user3) { create(:user) }

it "最初のユーザーを返す" do
  expect(User.first).to eq(user1)  # user2, user3は不要
end

# ✅ 良い例: 必要なデータのみ作成
let(:user) { create(:user) }

it "最初のユーザーを返す" do
  expect(User.first).to eq(user)
end
```

### 2. shared_examplesの未活用

```ruby
# ❌ 悪い例: 同じテストパターンを複数箇所で繰り返す
RSpec.describe AdminPolicy do
  it "管理者はアクセスできる" do
    expect(policy.allowed?(admin)).to be true
  end
  it "一般ユーザーはアクセスできない" do
    expect(policy.allowed?(user)).to be false
  end
end

# ✅ 良い例: shared_examplesで共通化
RSpec.shared_examples "管理者限定リソース" do
  it "管理者はアクセスできる" do
    expect(policy.allowed?(admin)).to be true
  end
  it "一般ユーザーはアクセスできない" do
    expect(policy.allowed?(user)).to be false
  end
end

RSpec.describe AdminPolicy do
  it_behaves_like "管理者限定リソース"
end
```

### 3. テストデータの過剰な作成

```ruby
# ❌ 悪い例: 不要な属性を毎回指定
let(:user) do
  create(:user,
    name: "テスト太郎",
    email: "test@example.com",
    age: 25,
    address: "東京都",
    phone: "090-1234-5678"
  )
end

# ✅ 良い例: ファクトリにデフォルト値を設定し、テストに必要な属性のみ指定
let(:user) { create(:user) }
let(:premium_user) { create(:user, :premium) }
```

## コードレビュー時のチェックポイント

1. **テスト名**: 何をテストしているか日本語で明確に記述されているか
2. **構成**: Arrange-Act-Assertのパターンに従っているか
3. **独立性**: `before(:all)`や共有状態を使っていないか
4. **ファクトリ**: traitを活用しているか、不要な属性を指定していないか
5. **モック**: 外部サービスのみモックし、内部実装をモックしていないか
6. **カバレッジ**: 正常系と異常系の両方をテストしているか

## 注意点

- テストは仕様書としても機能する。テスト名は振る舞いを記述する
- モックは外部依存（API、メール等）に限定し、アプリケーション内部のクラスはなるべくモックしない
- `travel_to`を使って時間に依存するテストを安定化させる
- テストの実行速度も重要。不要なDBアクセスを減らし、`build_stubbed`の活用を検討する
