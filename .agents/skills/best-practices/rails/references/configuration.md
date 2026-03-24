# 設定と構成のベストプラクティス

**原則**: 環境に依存しない、保守しやすい設定を維持する

アプリケーションの設定は一元管理し、環境ごとの違いを安全に扱うことが重要です。

## チェック観点

- シークレット情報が適切に管理されているか
- 環境変数が一元管理されているか
- 定数が適切な場所に定義されているか
- Gemfileが整理されているか
- initializersが適切に分割されているか

## 違反例

### 例1: 設定値の散在

```ruby
# ❌ 悪い例: マジックナンバーや設定値がコードに散在
class OrderService
  def apply_tax(amount)
    amount * 1.10  # 税率がハードコード
  end

  def free_shipping?(amount)
    amount >= 5000  # 送料無料の閾値がハードコード
  end

  def max_items
    50  # 最大アイテム数がハードコード
  end
end
```

### 例2: 環境変数の直接参照

```ruby
# ❌ 悪い例: ENV[]がコード全体に散在
class PaymentGateway
  def initialize
    @api_key = ENV["PAYMENT_API_KEY"]
    @api_secret = ENV["PAYMENT_API_SECRET"]
    @endpoint = ENV["PAYMENT_ENDPOINT"]
  end
end

class EmailService
  def send(to, subject, body)
    # ENV参照がバラバラの場所に
    from = ENV["MAIL_FROM"] || "noreply@example.com"
    smtp_host = ENV["SMTP_HOST"]
    # ...
  end
end
```

### 例3: 未整理のGemfile

```ruby
# ❌ 悪い例: グループ分けされていないGemfile
gem "rails"
gem "puma"
gem "pry"
gem "rspec-rails"
gem "factory_bot_rails"
gem "capistrano"
gem "bullet"
gem "rubocop"
gem "pg"
gem "redis"
```

## 改善例

### 例1の改善: 設定を一元管理

```ruby
# ✅ 良い例: config/settings.ymlまたはconfigモジュールで管理
# config/order.yml
# defaults: &defaults
#   tax_rate: 0.10
#   free_shipping_threshold: 5000
#   max_items: 50
#
# production:
#   <<: *defaults
#
# development:
#   <<: *defaults

class OrderService
  def apply_tax(amount)
    amount * (1 + Rails.application.config_for(:order)[:tax_rate])
  end

  def free_shipping?(amount)
    amount >= Rails.application.config_for(:order)[:free_shipping_threshold]
  end
end

# または定数モジュールとして定義
module OrderConfig
  TAX_RATE = 0.10
  FREE_SHIPPING_THRESHOLD = 5000
  MAX_ITEMS = 50
end
```

### 例2の改善: credentials / 設定クラスで一元管理

```ruby
# ✅ 良い例: Rails credentialsで管理
# rails credentials:edit
# payment:
#   api_key: xxx
#   api_secret: yyy
#   endpoint: https://api.payment.com

class PaymentGateway
  def initialize
    config = Rails.application.credentials.payment
    @api_key = config[:api_key]
    @api_secret = config[:api_secret]
    @endpoint = config[:endpoint]
  end
end

# 環境変数が必要な場合は設定クラスで一元管理
class AppConfig
  class << self
    def mail_from
      ENV.fetch("MAIL_FROM", "noreply@example.com")
    end

    def smtp_host
      ENV.fetch("SMTP_HOST") # 必須の環境変数は fetch で未設定時にエラーにする
    end
  end
end
```

### 例3の改善: Gemfileのグループ分け

```ruby
# ✅ 良い例: 用途別にグループ分け
source "https://rubygems.org"

gem "rails", "~> 7.1"
gem "pg"
gem "puma"
gem "redis"

group :development do
  gem "bullet"
  gem "annotate"
end

group :development, :test do
  gem "pry-byebug"
  gem "rspec-rails"
  gem "factory_bot_rails"
  gem "rubocop", require: false
  gem "rubocop-rails", require: false
end

group :test do
  gem "shoulda-matchers"
  gem "webmock"
end
```

## よくある違反パターン

### 1. タイムゾーンの未設定

```ruby
# ❌ 悪い例: タイムゾーンを設定していない
# Time.now がシステムのタイムゾーンに依存する

# ✅ 良い例: config/application.rb で設定
config.time_zone = "Tokyo"
config.active_record.default_timezone = :utc

# コードでは常にTime.currentやTime.zone.nowを使用
Time.current            # アプリケーションのタイムゾーン
Time.zone.now           # 同上
2.hours.ago             # タイムゾーン対応
Date.current            # タイムゾーン対応の日付
```

### 2. 定数のfreezeの漏れ

```ruby
# ❌ 悪い例: 文字列定数がfreezeされていない
ALLOWED_ROLES = ["admin", "editor", "viewer"]
# ALLOWED_ROLES << "hacker"  # 意図せず変更される可能性

# ✅ 良い例: freezeで不変にする
ALLOWED_ROLES = ["admin", "editor", "viewer"].freeze
DEFAULT_SETTINGS = {
  theme: "light",
  language: "ja",
  notifications: true
}.freeze
```

### 3. initializerの肥大化

```ruby
# ❌ 悪い例: 1つのinitializerに多くの設定を詰め込む
# config/initializers/setup.rb に全設定が入っている

# ✅ 良い例: 機能ごとにinitializerを分割
# config/initializers/sidekiq.rb
# config/initializers/redis.rb
# config/initializers/cors.rb
# config/initializers/mailer.rb
```

## コードレビュー時のチェックポイント

1. **ハードコード**: マジックナンバーや設定値がコードに直接書かれていないか
2. **シークレット**: APIキーやパスワードがcredentialsで管理されているか
3. **ENV参照**: `ENV[]`がコード全体に散在していないか（未設定時にnilになるリスク）
4. **Gemfileグループ**: 開発/テスト用のgemが本番に含まれていないか
5. **タイムゾーン**: `Time.now`の代わりに`Time.current`を使っているか
6. **freeze**: 定数が適切にfreezeされているか

## 注意点

- `ENV.fetch`は必須の環境変数に使い、未設定時にエラーで検知する
- `credentials.yml.enc`は環境ごとに分けることもできる（`credentials/production.yml.enc`）
- 設定ファイルが多くなりすぎた場合は`config_for`や`Settings`パターンの導入を検討する
- `.env`ファイルは`.gitignore`に含め、`.env.example`をリポジトリに含める
