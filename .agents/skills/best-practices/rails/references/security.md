# セキュリティのベストプラクティス

**原則**: Railsのセキュリティ機能を正しく活用し、脆弱性を防ぐ

Railsは多くのセキュリティ対策を組み込みで提供しています。しかし、不適切な使い方をするとこれらの保護を無効化してしまいます。

## チェック観点

- SQLインジェクションの危険がないか
- XSS脆弱性がないか
- CSRF対策が適切か
- Mass Assignment対策がされているか
- シークレット情報がコードにハードコードされていないか
- 認証・認可が適切に実装されているか

## 違反例

### 例1: SQLインジェクション

```ruby
# ❌ 悪い例: 文字列補間でSQLを組み立てる
User.where("email = '#{params[:email]}'")
User.where("name LIKE '%#{params[:query]}%'")
User.order("#{params[:sort_column]} #{params[:sort_direction]}")
```

### 例2: XSS脆弱性

```ruby
# ❌ 悪い例: ユーザー入力をhtml_safeで出力
<%= params[:message].html_safe %>
<%= raw user.bio %>
<%= content_tag(:div, user.comment.html_safe) %>
```

### 例3: シークレット情報のハードコード

```ruby
# ❌ 悪い例: APIキーをコードに直接記述
class PaymentService
  API_KEY = "sk_live_abc123def456"
  API_SECRET = "secret_xyz789"

  def charge(amount)
    HTTParty.post("https://api.payment.com/charge",
      headers: { "Authorization" => "Bearer #{API_KEY}" },
      body: { amount: amount }
    )
  end
end
```

## 改善例

### 例1の改善: パラメータバインドの使用

```ruby
# ✅ 良い例: プレースホルダーやハッシュ条件を使用
User.where(email: params[:email])
User.where("name LIKE ?", "%#{sanitize_sql_like(params[:query])}%")

# ソートカラムはホワイトリストで検証
ALLOWED_SORT_COLUMNS = %w[name email created_at].freeze
ALLOWED_SORT_DIRECTIONS = %w[asc desc].freeze

def sort_column
  ALLOWED_SORT_COLUMNS.include?(params[:sort_column]) ? params[:sort_column] : "created_at"
end

def sort_direction
  ALLOWED_SORT_DIRECTIONS.include?(params[:sort_direction]) ? params[:sort_direction] : "asc"
end

User.order("#{sort_column} #{sort_direction}")
```

### 例2の改善: 適切なエスケープ

```ruby
# ✅ 良い例: Railsのデフォルトエスケープを活用
<%= user.bio %>  <%# 自動的にHTMLエスケープされる %>

# HTMLを許可する場合はサニタイズ
<%= sanitize(user.bio, tags: %w[p br strong em]) %>

# ヘルパーを使う
<%= simple_format(user.bio) %>
```

### 例3の改善: credentials管理

```ruby
# ✅ 良い例: Rails credentialsを使用
class PaymentService
  def charge(amount)
    HTTParty.post("https://api.payment.com/charge",
      headers: { "Authorization" => "Bearer #{Rails.application.credentials.payment[:api_key]}" },
      body: { amount: amount }
    )
  end
end

# config/credentials.yml.enc に暗号化して保存
# rails credentials:edit で編集
# payment:
#   api_key: sk_live_abc123def456
#   api_secret: secret_xyz789
```

## よくある違反パターン

### 1. CSRF対策の無効化

```ruby
# ❌ 悪い例: CSRF保護を広範囲に無効化
class ApplicationController < ActionController::Base
  skip_before_action :verify_authenticity_token
end

# ✅ 良い例: API用コントローラーのみ無効化し、トークン認証を使用
class Api::BaseController < ActionController::API
  before_action :authenticate_api_token!
end
```

### 2. 認可の欠如

```ruby
# ❌ 悪い例: 認可チェックなしでリソースを操作
def update
  @post = Post.find(params[:id])  # 他のユーザーの投稿も更新できてしまう
  @post.update(post_params)
end

# ✅ 良い例: 現在のユーザーのリソースのみアクセス
def update
  @post = current_user.posts.find(params[:id])
  @post.update(post_params)
end
```

### 3. セッション固定攻撃への対策漏れ

```ruby
# ❌ 悪い例: ログイン後にセッションをリセットしない
def create
  user = User.authenticate(params[:email], params[:password])
  session[:user_id] = user.id
  redirect_to root_path
end

# ✅ 良い例: ログイン後にセッションをリセット
def create
  user = User.authenticate(params[:email], params[:password])
  reset_session
  session[:user_id] = user.id
  redirect_to root_path
end
```

## コードレビュー時のチェックポイント

1. **SQLインジェクション**: 文字列補間でSQLを組み立てていないか
2. **XSS**: `html_safe`、`raw`を安易に使っていないか
3. **CSRF**: 適切に保護されているか
4. **認可**: リソースアクセスが現在のユーザーに制限されているか
5. **シークレット**: APIキーやパスワードがコードにハードコードされていないか
6. **Mass Assignment**: `permit!`を使用していないか

## 注意点

- `html_safe`が必要な場面もある（ヘルパーメソッドでHTMLを構築する場合等）。その場合は入力値を必ずサニタイズする
- CSRF保護を無効化する場合は、代替の認証メカニズム（APIトークン等）を必ず実装する
- `Brakeman` gem を使って自動的にセキュリティ脆弱性をスキャンすることを推奨
