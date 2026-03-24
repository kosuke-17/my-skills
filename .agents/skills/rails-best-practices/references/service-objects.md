# サービスオブジェクトとデザインパターン

**原則**: 適切な設計パターンでビジネスロジックを整理し、モデルとコントローラーの肥大化を防ぐ

Fat ModelやFat Controllerを避けるために、ビジネスロジックを適切なオブジェクトに分離します。ただし、過度なパターン適用は複雑さを増すだけなので注意が必要です。

## チェック観点

- モデルやコントローラーにビジネスロジックが集中していないか
- 適切なデザインパターンが使われているか
- パターンが過剰に適用されていないか
- 単一責務の原則が守られているか

## 違反例

### 例1: Fat Model

```ruby
# ❌ 悪い例: モデルに多くの責務が集中
class User < ApplicationRecord
  # バリデーション
  validates :name, :email, presence: true

  # 認証ロジック
  def authenticate(password)
    BCrypt::Password.new(password_digest).is_password?(password)
  end

  # CSV出力
  def self.to_csv
    CSV.generate do |csv|
      csv << column_names
      all.each { |user| csv << user.attributes.values }
    end
  end

  # 通知ロジック
  def send_welcome_email
    UserMailer.welcome(self).deliver_later
  end

  def notify_slack
    SlackNotifier.new.post(channel: "#users", text: "新規ユーザー: #{name}")
  end

  # 外部API連携
  def sync_to_crm
    CrmApi.create_contact(name: name, email: email)
  end

  # レポート生成
  def generate_activity_report(start_date, end_date)
    # 50行以上の複雑なレポート生成ロジック...
  end

  # 権限チェック
  def can_edit?(resource)
    admin? || resource.user_id == id
  end
end
```

### 例2: 複数の責務を持つサービス

```ruby
# ❌ 悪い例: 1つのサービスが多くの責務を持つ
class UserRegistrationService
  def call(params)
    user = User.new(params)
    validate_age(user)
    validate_email_domain(user)
    user.save!
    send_welcome_email(user)
    notify_admin(user)
    sync_to_crm(user)
    create_default_settings(user)
    assign_trial_plan(user)
    user
  end

  private

  # 10以上のprivateメソッド...
end
```

## 改善例

### 例1の改善: 責務ごとにオブジェクトを分離

```ruby
# ✅ 良い例: モデルはデータとバリデーションに集中
class User < ApplicationRecord
  validates :name, :email, presence: true

  scope :active, -> { where(active: true) }
end

# Service Object: ビジネスロジック
class UserRegistrationService
  def initialize(params)
    @params = params
  end

  def call
    user = User.create!(@params)
    UserMailer.welcome(user).deliver_later
    user
  end
end

# Query Object: 複雑なクエリ
class UserActivityQuery
  def initialize(relation = User.all)
    @relation = relation
  end

  def call(start_date:, end_date:)
    @relation
      .joins(:activities)
      .where(activities: { created_at: start_date..end_date })
      .group(:id)
      .select("users.*, COUNT(activities.id) as activity_count")
  end
end

# Policy Object: 認可ロジック
class UserPolicy
  def initialize(user, resource)
    @user = user
    @resource = resource
  end

  def can_edit?
    @user.admin? || @resource.user_id == @user.id
  end
end
```

### 例2の改善: 単一責務のサービス

```ruby
# ✅ 良い例: 各サービスが1つの責務を持つ
class UserRegistrationService
  def call(params)
    user = User.create!(params)
    PostRegistrationJob.perform_later(user.id)
    user
  end
end

class PostRegistrationJob < ApplicationJob
  def perform(user_id)
    user = User.find(user_id)
    UserMailer.welcome(user).deliver_later
    CrmSyncService.new.call(user)
    DefaultSettingsService.new.call(user)
  end
end
```

## デザインパターン一覧

### 1. Service Object

```ruby
# 単一のビジネス操作をカプセル化
class TransferMoneyService
  def initialize(from_account:, to_account:, amount:)
    @from_account = from_account
    @to_account = to_account
    @amount = amount
  end

  def call
    ActiveRecord::Base.transaction do
      @from_account.withdraw(@amount)
      @to_account.deposit(@amount)
    end
  end
end

# 使用方法
TransferMoneyService.new(
  from_account: sender,
  to_account: receiver,
  amount: 1000
).call
```

### 2. Form Object

```ruby
# 複雑なフォームのバリデーションとデータ処理
class UserRegistrationForm
  include ActiveModel::Model

  attr_accessor :name, :email, :password, :terms_accepted

  validates :name, :email, :password, presence: true
  validates :terms_accepted, acceptance: true
  validates :password, length: { minimum: 8 }

  def save
    return false unless valid?

    User.create!(name: name, email: email, password: password)
  end
end
```

### 3. Query Object

```ruby
# 複雑なクエリをカプセル化
class RecentActiveUsersQuery
  def initialize(relation = User.all)
    @relation = relation
  end

  def call(days: 30, min_actions: 5)
    @relation
      .joins(:actions)
      .where(actions: { created_at: days.days.ago.. })
      .group("users.id")
      .having("COUNT(actions.id) >= ?", min_actions)
      .order("COUNT(actions.id) DESC")
  end
end

# 使用方法
RecentActiveUsersQuery.new.call(days: 7, min_actions: 10)
```

### 4. Decorator / Presenter

```ruby
# 表示ロジックをモデルから分離
class UserDecorator < SimpleDelegator
  def display_name
    "#{first_name} #{last_name}".strip.presence || email
  end

  def member_since
    created_at.strftime("%Y年%m月%d日")
  end

  def avatar_url
    if avatar.attached?
      Rails.application.routes.url_helpers.rails_blob_url(avatar)
    else
      "/images/default_avatar.png"
    end
  end
end

# 使用方法
decorator = UserDecorator.new(user)
decorator.display_name
```

## コードレビュー時のチェックポイント

1. **モデルの行数**: 100行を超えるモデルはロジックの分離を検討
2. **コントローラーの行数**: アクションが10行を超える場合はサービスへの委譲を検討
3. **命名**: サービスの命名が操作内容を明確に表しているか
4. **インターフェース**: `call`メソッドで統一されているか
5. **依存関係**: サービス間の依存が最小限か

## 注意点

- **YAGNI**: 単純なCRUDにService Objectは不要。複雑さが生じたときに導入する
- Service Objectは「動詞」で命名する（`CreateOrder`、`TransferMoney`）
- 1つのサービスに`call`以外のパブリックメソッドが多い場合は責務が多すぎる
- Decorator gemの導入は必須ではない。`SimpleDelegator`で十分な場合が多い
- パターンの適用は段階的に。最初からすべてのパターンを導入しない
