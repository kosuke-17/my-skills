# Phase 3: 型定義 (types) — 詳細手順

コードの最初の一歩。型を先に確定することで、以降のフェーズすべてに型安全性を波及させる。

---

## Step 3-1: APIレスポンス型の定義

### やること

- Phase 0 で特定した全APIエンドポイントのレスポンス型を定義する
- リクエスト型も併せて定義する

### 手順

1. 各APIエンドポイントの実際のレスポンス JSON を確認する（API仕様書、Swagger、実際のレスポンス等）
2. JSON → TypeScript 型に変換する
3. ページネーションなどの共通レスポンスラッパーを先に定義する
4. null / undefined の扱いを明確にする（APIが返す可能性のある欠損値）

### コーディング規約

```typescript
// ファイル名: [resource]-api.types.ts

// レスポンスラッパー（共通の場合は shared types に配置）
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// 個別リソースのAPIレスポンス型
// API が返す「そのまま」の型。フロントエンド用の変換は Step 3-2 で行う
export interface UserApiResponse {
  id: string
  email: string
  full_name: string // snake_case（APIの命名に合わせる）
  role: 'admin' | 'manager' | 'member'
  created_at: string // ISO 8601
  updated_at: string
  avatar_url: string | null
}

// リクエスト型
export interface CreateUserRequest {
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'member'
}

export interface UpdateUserRequest {
  full_name?: string
  role?: 'admin' | 'manager' | 'member'
}

// クエリパラメータ型
export interface UserListParams {
  page?: number
  perPage?: number
  search?: string
  role?: string
  sortBy?: 'full_name' | 'created_at' | 'email'
  sortOrder?: 'asc' | 'desc'
}
```

### 完了条件

- 全エンドポイントのレスポンス型が定義されている
- リクエスト型（body / params）が定義されている
- null / undefined の扱いが明記されている

---

## Step 3-2: フロントエンド用ドメインモデル型の定義

### やること

- APIレスポンス型をフロントエンドで扱いやすい形に変換した型を定義する
- snake_case → camelCase の変換等を反映する

### 手順

1. APIレスポンス型から、フロントエンドで使う形に整形した型を作る
2. 日付文字列を Date に変換するか、文字列のままにするかを決定する
3. 計算プロパティ（displayName等）を追加するか判断する
4. APIとドメインの差分が大きい場合は、変換関数の型も定義する

### コーディング規約

```typescript
// ファイル名: [domain].types.ts

// フロントエンド用ドメインモデル
export interface User {
  id: string
  email: string
  fullName: string // camelCase に変換
  role: UserRole
  createdAt: Date // Date オブジェクトに変換
  updatedAt: Date
  avatarUrl: string | null
}

// Enum / Union Types
export type UserRole = 'admin' | 'manager' | 'member'

// 状態に応じた派生型
export interface UserWithSelection extends User {
  isSelected: boolean
}

// ソート・フィルター用の型
export interface UserSortConfig {
  key: keyof Pick<User, 'fullName' | 'email' | 'createdAt'>
  direction: 'asc' | 'desc'
}

export interface UserFilterConfig {
  search: string
  role: UserRole | 'all'
}
```

### 完了条件

- 全ドメインモデル型が定義されている
- API型との対応関係が明確

---

## Step 3-3: コンポーネントProps型の定義

### やること

- Phase 2 で特定した全コンポーネントの Props 型を定義する
- コールバック関数のシグネチャを確定する

### 手順

1. Phase 2 のファイルマップから全コンポーネントを列挙する
2. 各コンポーネントに必要な props を Phase 1 のセクション定義から導出する
3. コールバック関数（onXxx）の引数と返り値を確定する
4. children / render props の型を定義する
5. オプショナル props にデフォルト値を設定するか判断する

### コーディング規約

```typescript
// ファイル名: [component].types.ts または types/index.ts にまとめる

// テーブルコンポーネント
export interface UserTableProps {
  users: User[]
  isLoading: boolean
  sortConfig: UserSortConfig
  onSortChange: (config: UserSortConfig) => void
  onRowClick: (userId: string) => void
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
}

// フィルターバー
export interface UserFilterBarProps {
  filterConfig: UserFilterConfig
  onFilterChange: (config: UserFilterConfig) => void
  resultCount: number
}

// モーダル
export interface UserCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
}

// ページヘッダー
export interface UserPageHeaderProps {
  title: string
  onCreateClick: () => void
  selectedCount: number
}
```

### 完了条件

- 全コンポーネントの Props 型が定義されている
- 全コールバック関数のシグネチャが確定している

---

## Step 3-4: フォーム入力値・バリデーション型の定義

### やること

- フォームがある場合、入力値の型とバリデーションルール型を定義する

### コーディング規約

```typescript
// フォーム値型
export interface UserFormValues {
  email: string
  fullName: string
  role: UserRole
}

// バリデーションエラー型
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>

// フォーム状態型
export interface UserFormState {
  values: UserFormValues
  errors: UserFormErrors
  isSubmitting: boolean
  isDirty: boolean
}

// 初期値の定義
export const USER_FORM_INITIAL_VALUES: UserFormValues = {
  email: '',
  fullName: '',
  role: 'member',
}
```

### 完了条件

- 全フォームの入力値型が定義されている
- バリデーションエラー型が定義されている

---

## Step 3-5: 状態管理用の型（State / Action）定義

### やること

- useReducer や zustand 等で管理する状態の型を定義する
- ページレベルの複合状態型を定義する

### コーディング規約

```typescript
// ページレベルの状態型
export interface UserPageState {
  users: User[]
  isLoading: boolean
  error: string | null
  filterConfig: UserFilterConfig
  sortConfig: UserSortConfig
  pagination: PaginationState
  selectedIds: Set<string>
  isCreateModalOpen: boolean
}

// ページネーション状態型
export interface PaginationState {
  currentPage: number
  perPage: number
  total: number
}

// useReducer を使う場合の Action 型
export type UserPageAction =
  | { type: 'SET_USERS'; payload: { users: User[]; total: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER'; payload: UserFilterConfig }
  | { type: 'SET_SORT'; payload: UserSortConfig }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'TOGGLE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_CREATE_MODAL' }
```

### 完了条件

- ページレベルの状態型が定義されている
- 状態遷移のパターンが型で表現されている

---

## Step 3-6: 型ファイルの作成と export 構成

### やること

- 上記の型定義を実際のファイルに書き出す
- index.ts での re-export を構成する
- TypeScript コンパイルでエラーがないことを確認する

### 手順

1. Phase 2 のファイルマップに従って型ファイルを作成する
2. 各ファイルに型を配置する
3. types/index.ts で re-export する
4. `tsc --noEmit` でコンパイルチェック（可能な場合）

### 出力

```typescript
// types/index.ts
export type {
  // API 型
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
  PaginatedResponse,
  // ドメイン型
  User,
  UserRole,
  UserWithSelection,
  UserSortConfig,
  UserFilterConfig,
  // コンポーネント Props
  UserTableProps,
  UserFilterBarProps,
  UserCreateModalProps,
  UserPageHeaderProps,
  // フォーム
  UserFormValues,
  UserFormErrors,
  UserFormState,
  // 状態管理
  UserPageState,
  PaginationState,
  UserPageAction,
} from './user.types'
// ... 必要に応じてファイル分割
```

### 完了条件

- 全型ファイルが作成されている
- index.ts で適切に re-export されている
- コンパイルエラーがない

---

## Phase 3 完了チェック

```
✅ 全APIレスポンスに対応する型が定義されている
✅ フロントエンド用ドメインモデル型が定義されている
✅ 全コンポーネントのProps型が定義されている
✅ フォーム型が定義されている（該当する場合）
✅ 状態管理用の型が定義されている
✅ 型ファイルが作成され、コンパイルエラーがない
```

すべてOKなら → **Phase 4 へ進む**
