# Phase 4: API層 / データ取得層 — 詳細手順

データの入出力インターフェースを実装する。Phase 3 の型を最大限活用して型安全に構築する。

---

## Step 4-1: API クライアント関数の実装

### やること

- 各 API エンドポイントに対応する関数を実装する
- Phase 3 で定義したリクエスト型 / レスポンス型を使用する

### 手順

1. 共通の fetch ラッパー（ベースURL、ヘッダー、エラーハンドリング）が存在するか確認する
2. 存在しない場合は最小限のラッパーを作成する
3. 各エンドポイントに対応する関数を実装する
4. レスポンスの型チェックを組み込む

### コーディング規約

```typescript
// [resource].api.ts
import type {
  UserApiResponse,
  UserListParams,
  CreateUserRequest,
  PaginatedResponse,
} from '../types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// GET 系
export async function fetchUsers(
  params: UserListParams
): Promise<PaginatedResponse<UserApiResponse>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set('page', String(params.page))
  if (params.perPage) searchParams.set('per_page', String(params.perPage))
  if (params.search) searchParams.set('search', params.search)
  // ... 他パラメータ

  const response = await fetch(`${BASE_URL}/users?${searchParams}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }

  return response.json()
}

export async function fetchUserById(id: string): Promise<UserApiResponse> {
  const response = await fetch(`${BASE_URL}/users/${id}`)
  if (!response.ok) {
    throw new ApiError(response.status, await response.text())
  }
  return response.json()
}
```

### チェックポイント

```
□ 全 GET エンドポイントの関数がある
□ 全 POST/PUT/PATCH/DELETE エンドポイントの関数がある
□ 引数と返り値に Phase 3 の型が使われている
□ クエリパラメータの組み立てが正しい
□ 認証ヘッダーの付与が適切
```

### 完了条件

- 全エンドポイントに対応する関数が実装されている

---

## Step 4-2: Server Actions の実装（必要な場合）

### やること

- フォーム送信や mutation 処理を Server Action として実装する
- `'use server'` ディレクティブを付与する

### 手順

1. Phase 0 の書き込み操作一覧を確認する
2. 各操作に対応する Server Action を作成する
3. バリデーションロジックを含める
4. revalidatePath / revalidateTag を設定する

### コーディング規約

```typescript
// [resource].server.ts
'use server'

import { revalidatePath } from 'next/cache'

import type { CreateUserRequest, UserApiResponse } from '../types'

// [resource].server.ts

export async function createUser(
  formData: CreateUserRequest
): Promise<{ success: boolean; data?: UserApiResponse; error?: string }> {
  // 1. サーバーサイドバリデーション
  const validationError = validateCreateUser(formData)
  if (validationError) {
    return { success: false, error: validationError }
  }

  // 2. API呼び出し
  try {
    const response = await fetch(`${process.env.API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: errorText }
    }

    const data: UserApiResponse = await response.json()

    // 3. キャッシュ無効化
    revalidatePath('/dashboard/users')

    return { success: true, data }
  } catch (error) {
    return { success: false, error: '通信エラーが発生しました' }
  }
}
```

### 完了条件

- 全書き込み操作に対応する Server Action がある
- バリデーションが含まれている
- キャッシュ無効化が設定されている

---

## Step 4-3: カスタムフックの実装（useXxx）

### やること

- データ取得・状態管理のロジックをカスタムフックに抽出する
- Phase 3 の状態型を使用する

### 手順

1. Phase 1 のインタラクション一覧から、状態管理が必要なものを特定する
2. 関連するステートをグループ化してフック単位にまとめる
3. 各フックのインターフェース（引数・返り値）を確定してから実装する
4. API関数との接続を行う
5. API型 → ドメイン型の変換をフック内で行う

### コーディング規約

```typescript
// use-[name].ts
'use client'

import { useState, useCallback, useEffect } from 'react'

import { fetchUsers } from '../api'
import type {
  User,
  UserFilterConfig,
  UserSortConfig,
  PaginationState,
} from '../types'
import { toUser } from '../utils/format-user'

// use-[name].ts

interface UseUsersReturn {
  users: User[]
  isLoading: boolean
  error: string | null
  pagination: PaginationState
  refetch: () => Promise<void>
  setPage: (page: number) => void
  setFilter: (filter: UserFilterConfig) => void
  setSort: (sort: UserSortConfig) => void
}

export function useUsers(
  initialFilter: UserFilterConfig,
  initialSort: UserSortConfig
): UseUsersReturn {
  // 実装...
}
```

### フック設計チェックリスト

```
□ フックの責務は単一か（1つのフックが多すぎる責務を持っていないか）
□ 返り値の型が明示されているか
□ 不要な再レンダリングを防ぐ工夫（useCallback, useMemo）があるか
□ クリーンアップ処理（useEffect の return）が必要な場合、実装されているか
□ エラー状態が適切にハンドリングされているか
```

### 完了条件

- 全カスタムフックが実装されている
- API関数との接続が完了している

---

## Step 4-4: エラーハンドリングパターンの統一

### やること

- API層全体で一貫したエラーハンドリングを実装する

### 手順

1. カスタムエラークラスを定義する
2. HTTP ステータスコード別のハンドリングを統一する
3. ユーザー向けエラーメッセージのマッピングを作成する
4. リトライロジックの要否を判断する

### コーディング規約

```typescript
// errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public serverMessage: string
  ) {
    super(`API Error ${statusCode}: ${serverMessage}`)
    this.name = 'ApiError'
  }

  get userMessage(): string {
    switch (this.statusCode) {
      case 401:
        return '認証が切れました。再ログインしてください。'
      case 403:
        return 'この操作を行う権限がありません。'
      case 404:
        return '指定されたリソースが見つかりません。'
      case 422:
        return '入力内容に誤りがあります。'
      case 429:
        return 'リクエストが多すぎます。しばらく待ってから再試行してください。'
      case 500:
        return 'サーバーエラーが発生しました。時間をおいて再試行してください。'
      default:
        return '予期しないエラーが発生しました。'
    }
  }
}
```

### 完了条件

- エラークラスが定義されている
- ステータスコード別のメッセージマッピングがある
- 全API関数でエラーハンドリングが統一されている

---

## Step 4-5: ローディング・キャッシュ戦略の決定

### やること

- データ取得時のローディング戦略を決定する
- キャッシュの有無・期間を設定する

### 確認項目

```
1. 初回ローディング: Suspense / スケルトンUI / スピナー
2. 再取得時のローディング: 既存データを表示しつつバックグラウンド更新 or ローディング表示
3. fetch の cache 設定: 'force-cache' / 'no-store' / next: { revalidate: N }
4. 楽観的更新の有無
5. SWR / React Query などのライブラリ使用の有無
```

### 完了条件

- ローディング戦略が決定し、フックに反映されている
- キャッシュ設定が全fetch関数に適用されている

---

## Step 4-6: API層の単体テスト（モック含む）

### やること

- API関数のテストを作成する（任意だが推奨）
- モックの戦略を決定する

### 確認項目

```
□ テストする場合のモック方法（msw / jest.mock / カスタムモック）
□ 正常系テスト（期待するレスポンスが返る）
□ 異常系テスト（エラーレスポンスの処理が正しい）
□ 型変換テスト（API型 → ドメイン型の変換が正しい）
```

### 完了条件

- テスト方針が決定している
- 必要に応じてテストファイルが作成されている

---

## Phase 4 完了チェック

```
✅ 全APIエンドポイントに対応する関数/Actionがある
✅ カスタムフックが実装されている
✅ エラーハンドリングが統一されている
✅ 型安全性が確保されている（Phase 3 の型を使用）
✅ ローディング・キャッシュ戦略が決定している
```

すべてOKなら → **Phase 5 へ進む**
