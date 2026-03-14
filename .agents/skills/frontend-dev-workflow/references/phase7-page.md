# Phase 7: page.tsx 組み立て — 詳細手順

ルーティングに対応するページファイルを完成させる。Phase 3〜6 の成果物を統合する。

---

## Step 7-1: page.tsx のファイル作成とメタデータ設定

### やること

- app ディレクトリ内に page.tsx を作成する
- 基本的なページ構造を設定する

### 手順

```
1. Phase 2 で決定したパスに page.tsx を作成する
2. default export の関数コンポーネントを定義する
3. Server Component として実装する（'use client' をつけない）
4. ページ関数の引数を設定する:
   - params: 動的ルートのパラメータ
   - searchParams: クエリパラメータ
```

### コーディング規約

```typescript
// app/dashboard/users/page.tsx
import type { Metadata } from 'next'

// 静的メタデータ（動的でない場合）
export const metadata: Metadata = {
  title: 'ユーザー管理',
  description: 'ユーザーの一覧表示・作成・編集',
}

// ページコンポーネント
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sort?: string }>
}) {
  const params = await searchParams
  // ...
}
```

### 動的メタデータが必要な場合

```typescript
// 動的セグメントを使う場合
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const user = await fetchUserById(id)

  return {
    title: `${user.fullName} | ユーザー管理`,
    description: `${user.fullName} のユーザー情報`,
  }
}
```

### 完了条件

- page.tsx が作成されている
- メタデータが設定されている
- ページ関数の引数型が正しい

---

## Step 7-2: layout.tsx の確認・調整

### やること

- このルートに専用の layout.tsx が必要か判断する
- 必要な場合は作成する

### 判断基準

```
layout.tsx が必要なケース:
□ このルートグループ固有のヘッダー / サイドバーがある
□ 子ルート間で共有する UI 要素がある
□ ネストされたレイアウトが必要
□ Provider の挿入が必要（コンテキスト等）

layout.tsx が不要なケース:
□ 親の layout.tsx で十分
□ この画面固有のレイアウト要素がない
```

### コーディング規約（必要な場合）

```typescript
// app/dashboard/users/layout.tsx

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="...">
      {/* ルートグループ固有のUI */}
      {children}
    </div>
  );
}
```

### 完了条件

- layout.tsx の要否が判断されている
- 必要な場合は作成されている

---

## Step 7-3: Server Component としてのデータ取得

### やること

- page.tsx 内で必要なデータを Server Component として取得する
- Phase 4 の API 関数を使用する

### 手順

```
1. ページの表示に必要なデータ取得関数を特定する
2. searchParams からクエリ条件を抽出する
3. async/await でデータを取得する
4. エラーハンドリングを実装する（try/catch or error.tsx 委譲）
5. 取得したデータを Phase 3 のドメイン型に変換する
```

### コーディング規約

```typescript
export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;

  // 1. クエリパラメータの解析
  const page = Number(params.page) || 1;
  const search = params.search || '';
  const sort = params.sort || 'created_at';

  // 2. データ取得
  const usersResponse = await fetchUsers({
    page,
    perPage: 20,
    search,
    sortBy: sort as UserSortConfig['key'],
    sortOrder: 'desc',
  });

  // 3. ドメイン型に変換
  const users = usersResponse.data.map(toUser);
  const pagination: PaginationState = {
    currentPage: usersResponse.page,
    perPage: usersResponse.perPage,
    total: usersResponse.total,
  };

  // 4. Client Component に渡す
  return (
    <UsersPageContent
      initialUsers={users}
      initialPagination={pagination}
      initialSearch={search}
    />
  );
}
```

### チェックリスト

```
□ データ取得が Server Component 内で行われている
□ searchParams が正しく解析されている
□ 型変換が適用されている
□ エラー時のフォールバックがある
```

### 完了条件

- サーバーサイドでのデータ取得が実装されている

---

## Step 7-4: Client Component への Props 受け渡し

### やること

- Server Component で取得したデータを Client Component に渡す
- シリアライズ可能な形式で渡す

### 注意事項

```
Server → Client に渡せるもの:
✅ プリミティブ値（string, number, boolean）
✅ プレーンオブジェクト / 配列
✅ Date（文字列にシリアライズされる）
✅ null, undefined

Server → Client に渡せないもの:
❌ 関数
❌ クラスインスタンス
❌ Map, Set（JSON にシリアライズ不可）
❌ Symbol
❌ DOM 要素
```

### Set を使う場合の対処

```typescript
// Server Component
<UsersPageContent
  initialUsers={users}
  initialSelectedIds={[]}  // Set ではなく配列で渡す
/>

// Client Component
function UsersPageContent({ initialSelectedIds }: Props) {
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(initialSelectedIds)  // Client 側で Set に変換
  );
}
```

### 完了条件

- 全データが Client Component に正しく渡されている
- シリアライズ不可能な型を渡していない

---

## Step 7-5: Suspense / loading.tsx / error.tsx の設定

### やること

- ローディング状態とエラー状態の UI を実装する

### loading.tsx

```typescript
// app/dashboard/users/loading.tsx

export default function UsersLoading() {
  return (
    <div className="...">
      {/* ページヘッダーのスケルトン */}
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />

      {/* フィルターバーのスケルトン */}
      <div className="h-10 w-full bg-gray-200 animate-pulse rounded mt-4" />

      {/* テーブルのスケルトン */}
      <div className="mt-4 space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    </div>
  );
}
```

### error.tsx

```typescript
// app/dashboard/users/error.tsx
'use client';

export default function UsersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="...">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

### Suspense の追加（ページ内部分ローディング）

```typescript
import { Suspense } from 'react';

export default async function UsersPage({ searchParams }: Props) {
  return (
    <div>
      <UserPageHeader />
      <Suspense fallback={<UserTableSkeleton />}>
        <UserTableContainer searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
```

### 完了条件

- loading.tsx が実装されている
- error.tsx が実装されている
- 必要に応じて Suspense バウンダリが設置されている

---

## Step 7-6: ページレベルのレイアウト組み立て

### やること

- Phase 1 のレイアウト構成に従って、コンポーネントを配置する

### 手順

```
1. Phase 1 のレイアウト図を参照する
2. セクション順にコンポーネントを配置する
3. セクション間のスペーシングを設定する
4. レスポンシブレイアウトを適用する
```

### 完了条件

- Phase 1 の画面仕様通りにコンポーネントが配置されている
- レスポンシブ対応が適用されている

---

## Step 7-7: 画面遷移（Link / useRouter）の接続

### やること

- ページからの遷移リンクを実装する
- プログラム的なナビゲーションを実装する

### 手順

```
1. Phase 0 の遷移先一覧を確認する
2. 静的リンク → next/link の Link コンポーネント
3. 動的ナビゲーション → useRouter().push()
4. ページ内のURLパラメータ更新 → useRouter().replace() or useSearchParams()
5. パンくずリスト（必要な場合）
```

### コーディング規約

```typescript
// 静的リンク
import Link from 'next/link';
<Link href={`/dashboard/users/${user.id}`}>詳細</Link>

// 動的ナビゲーション
'use client';
import { useRouter } from 'next/navigation';

const router = useRouter();
const handleRowClick = (userId: string) => {
  router.push(`/dashboard/users/${userId}`);
};

// URLパラメータ更新（フィルター・ソート・ページネーション）
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const updateSearchParams = (key: string, value: string) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(key, value);
  router.replace(`${pathname}?${params.toString()}`);
};
```

### チェックリスト

```
□ 全遷移先に対応するリンク / ナビゲーションがある
□ Link コンポーネントに prefetch が適切に設定されている
□ URLパラメータの更新が正しく動作する
□ ブラウザの戻る / 進むが正しく機能する
```

### 完了条件

- 全画面遷移が実装されている
- URLとUIの状態が同期している

---

## Step 7-8: SEO 対応

### やること

- メタデータ、構造化データ、OGP を適切に設定する

### 確認項目

```
□ title が設定されている
□ description が設定されている
□ OGP タグ（og:title, og:description, og:image）が設定されている（公開ページの場合）
□ canonical URL が設定されている（必要な場合）
□ noindex の設定（管理画面等の場合）
□ 構造化データ（JSON-LD）の設定（必要な場合）
```

### 完了条件

- SEO 関連のメタデータが適切に設定されている

---

## Step 7-9: 全体結合テスト

### やること

- ページ全体が正しく動作することを確認する

### テストシナリオ

```
1. 初回アクセス:
   □ loading.tsx が表示される
   □ データ取得後、正常に表示される

2. データ操作:
   □ フィルター入力 → テーブル更新 → URL更新
   □ ソートクリック → テーブル更新 → URL更新
   □ ページネーション → テーブル更新 → URL更新
   □ 行クリック → 詳細ページ遷移

3. CRUD操作（該当する場合）:
   □ 新規作成ボタン → モーダル → 入力 → 送信 → 成功トースト → テーブル更新
   □ 削除 → 確認ダイアログ → 確認 → 成功トースト → テーブル更新

4. エラー系:
   □ API エラー → error.tsx or エラー表示
   □ ネットワークエラー → エラー表示 + リトライ
   □ バリデーションエラー → フォームエラー表示

5. エッジケース:
   □ データ0件 → エンプティステート
   □ 大量データ → パフォーマンス確認
   □ ブラウザリロード → 状態復元（URL経由）
   □ 戻る / 進む → 正しい状態表示
```

### 完了条件

- 全テストシナリオがパスしている

---

## Phase 7 完了チェック

```
✅ page.tsx が正常にレンダリングされる
✅ メタデータが設定されている
✅ サーバーサイドデータ取得が動作する
✅ Client Component との Props 受け渡しが正しい
✅ loading.tsx / error.tsx が実装されている
✅ 全状態パターン（loading/error/empty/success）が動作する
✅ 画面遷移が正しく機能する
✅ URLとUIの状態が同期している
```

すべてOKなら → **Phase 8 へ進む**
