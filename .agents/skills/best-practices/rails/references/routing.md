# ルーティングのベストプラクティス

**原則**: RESTfulな設計を基本とし、見通しの良いルーティングを維持する

ルーティングはアプリケーションの設計を反映します。RESTfulな設計を基本とし、シンプルで予測可能なURL構造を保つことが重要です。

## チェック観点

- RESTfulなリソース設計になっているか
- ネストが深すぎないか（最大2階層）
- カスタムルートが多すぎないか
- 名前空間が適切に使われているか
- routes.rbが肥大化していないか

## 違反例

### 例1: 深いネスト

```ruby
# ❌ 悪い例: 3階層以上のネスト
resources :companies do
  resources :departments do
    resources :teams do
      resources :members do
        resources :tasks
      end
    end
  end
end
# => /companies/1/departments/2/teams/3/members/4/tasks/5
```

### 例2: 非RESTfulなルーティング

```ruby
# ❌ 悪い例: カスタムアクションが多すぎる
resources :users do
  member do
    get :profile
    get :settings
    post :activate
    post :deactivate
    post :send_notification
    get :download_report
    post :change_role
    get :activity_log
  end
  collection do
    get :search
    get :export_all
    post :bulk_delete
    post :bulk_update
  end
end
```

## 改善例

### 例1の改善: 浅いネストとshallow

```ruby
# ✅ 良い例: shallowオプションで浅いネストに
resources :companies do
  resources :departments, shallow: true do
    resources :teams, shallow: true
  end
end

# または、必要な関連のみネスト
resources :companies do
  resources :departments, only: [:index, :create]
end
resources :departments, only: [:show, :update, :destroy] do
  resources :teams, only: [:index, :create]
end
resources :teams, only: [:show, :update, :destroy]
```

### 例2の改善: 別リソースとして切り出し

```ruby
# ✅ 良い例: RESTfulなリソースに分解
resources :users, only: [:index, :show, :create, :update, :destroy]

# ユーザーのプロフィールは別リソース
resource :profile, only: [:show, :update]

# ユーザーの有効化/無効化は状態変更リソース
resources :user_activations, only: [:create, :destroy]

# 検索は専用エンドポイント
resources :user_searches, only: [:index]

# エクスポートは専用リソース
resources :user_exports, only: [:create, :show]

# 一括操作は専用リソース
resources :user_bulk_operations, only: [:create]
```

## よくある違反パターン

### 1. 名前空間の未活用

```ruby
# ❌ 悪い例: 管理者用ルートがフラットに並ぶ
get "/admin_users", to: "admin#users"
get "/admin_orders", to: "admin#orders"
get "/admin_dashboard", to: "admin#dashboard"

# ✅ 良い例: 名前空間で整理
namespace :admin do
  root to: "dashboards#show"
  resources :users
  resources :orders
end
```

### 2. concernsの未活用

```ruby
# ❌ 悪い例: 同じルーティングパターンの繰り返し
resources :articles do
  resources :comments, only: [:index, :create, :destroy]
end
resources :photos do
  resources :comments, only: [:index, :create, :destroy]
end
resources :videos do
  resources :comments, only: [:index, :create, :destroy]
end

# ✅ 良い例: concernsで共通化
concern :commentable do
  resources :comments, only: [:index, :create, :destroy]
end

resources :articles, concerns: :commentable
resources :photos, concerns: :commentable
resources :videos, concerns: :commentable
```

### 3. matchの乱用

```ruby
# ❌ 悪い例: matchで全HTTPメソッドを受け付ける
match "/login", to: "sessions#create", via: :all

# ✅ 良い例: 適切なHTTPメソッドを指定
get "/login", to: "sessions#new"
post "/login", to: "sessions#create"
delete "/logout", to: "sessions#destroy"
```

## コードレビュー時のチェックポイント

1. **RESTful設計**: リソースベースのルーティングになっているか
2. **ネストの深さ**: 2階層以内に収まっているか
3. **カスタムアクション**: member/collectionのカスタムアクションが3つ以内か
4. **名前空間**: 管理画面やAPIなど用途別に名前空間が分かれているか
5. **only/except**: 不要なルートが生成されていないか
6. **routes.rbのサイズ**: 肥大化している場合はdrawマクロで分割を検討

## 注意点

- RESTfulに固執しすぎて不自然なリソース名にしない
- `shallow`は便利だが、URLの一貫性が崩れることがある
- `routes.rb`が大きくなったら`draw`マクロで分割できる（Rails 6+）
- APIとWebでルーティングファイルを分離することを検討する
