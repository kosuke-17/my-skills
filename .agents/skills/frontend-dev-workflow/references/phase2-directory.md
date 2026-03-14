# Phase 2: ディレクトリ設計 & ファイルマップ — 詳細手順

このフェーズでも **コードは書かない**。実装前にすべてのファイルパスと役割を確定する。

---

## Step 2-1: feature ディレクトリ名の決定

### やること

- feature の命名を確定する
- 命名規則を確認する

### 命名ルール

```
1. kebab-case を使用（例: user-management, order-history）
2. 単数形 or 複数形をプロジェクトの慣習に合わせる
3. 機能を端的に表す名前にする
4. 略語は避ける（ux → user-experience のように）
```

### 確認項目

```
1. feature名: ___________
2. 配置先: src/features/[feature名]/ or app/(routes)/[route]/_features/[feature名]/
3. プロジェクトの既存命名規則との整合性確認
```

### 完了条件

- feature ディレクトリ名が確定している
- 配置パスが確定している

---

## Step 2-2: ファイルツリーの作成

### やること

- feature ディレクトリ配下の全ファイルパスを列挙する
- 各ファイルに1行説明をつける

### 標準ディレクトリ構成（テンプレート）

```
src/features/[feature-name]/
├── index.ts                    # feature の公開API（re-export）
├── types/
│   ├── index.ts                # 型の re-export
│   ├── [domain].types.ts       # ドメインモデル型
│   ├── [api].types.ts          # APIレスポンス/リクエスト型
│   └── [component].types.ts    # コンポーネントProps型
├── api/
│   ├── index.ts                # API関数の re-export
│   ├── [resource].api.ts       # APIクライアント関数
│   └── [resource].server.ts    # Server Actions
├── hooks/
│   ├── index.ts                # hooks の re-export
│   ├── use-[name].ts           # カスタムフック
│   └── use-[name].ts
├── components/
│   ├── index.ts                # コンポーネントの re-export
│   ├── [component-name]/
│   │   ├── [component-name].tsx           # コンポーネント本体
│   │   ├── [component-name].test.tsx      # テスト（任意）
│   │   └── index.ts                       # re-export
│   └── [component-name]/
│       ├── [component-name].tsx
│       └── index.ts
├── utils/
│   ├── index.ts                # ユーティリティの re-export
│   └── [util-name].ts          # ユーティリティ関数
└── constants/
    └── index.ts                # 定数定義
```

### app ディレクトリ側

```
app/[route]/
├── page.tsx                    # ページコンポーネント（Server Component）
├── layout.tsx                  # レイアウト（必要な場合）
├── loading.tsx                 # ローディングUI
├── error.tsx                   # エラーUI
└── not-found.tsx               # 404 UI（必要な場合）
```

### 手順

1. 上記テンプレートをベースに、Phase 1 のセクション構成からコンポーネントを導出する
2. 各セクション → 1つ以上のコンポーネントにマッピングする
3. セクション内の複雑な部分は子コンポーネントに分割する
4. 共有されるロジック → hooks/ に抽出する
5. 共有されるUI → components/ 直下 or 共通ディレクトリに配置する

### 出力フォーマット

```
## ファイルマップ

### feature ディレクトリ
src/features/user-management/
├── index.ts                          # Public API
├── types/
│   ├── index.ts                      # 型 re-export
│   ├── user.types.ts                 # User ドメイン型
│   └── user-api.types.ts             # API型
├── api/
│   ├── index.ts                      # API re-export
│   ├── user.api.ts                   # fetchUsers, fetchUserById
│   └── user.server.ts               # createUser, updateUser (Server Action)
├── hooks/
│   ├── index.ts                      # hooks re-export
│   ├── use-users.ts                  # ユーザー一覧取得・フィルタリング
│   └── use-user-form.ts             # フォーム状態管理
├── components/
│   ├── index.ts                      # コンポーネント re-export
│   ├── user-table/
│   │   ├── user-table.tsx            # テーブル本体 [CC]
│   │   ├── user-table-row.tsx        # テーブル行 [CC]
│   │   ├── user-table-header.tsx     # ソート付きヘッダー [CC]
│   │   └── index.ts
│   ├── user-filter-bar/
│   │   ├── user-filter-bar.tsx       # フィルターUI [CC]
│   │   └── index.ts
│   ├── user-create-modal/
│   │   ├── user-create-modal.tsx     # 新規作成モーダル [CC]
│   │   └── index.ts
│   └── user-page-header/
│       ├── user-page-header.tsx      # ページヘッダー [SC]
│       └── index.ts
├── utils/
│   ├── index.ts
│   └── format-user.ts               # 表示用フォーマット関数
└── constants/
    └── index.ts                      # テーブル列定義、フィルター選択肢等

### app ディレクトリ
app/dashboard/users/
├── page.tsx                          # ページ本体 [SC]
├── loading.tsx                       # スケルトンUI
└── error.tsx                         # エラーバウンダリ
```

### 完了条件

- 全ファイルパスが列挙されている
- 各ファイルに1行説明がある

---

## Step 2-3: Server Component / Client Component の分類

### やること

- 全コンポーネントファイルを SC（Server Component）または CC（Client Component）に分類する

### 分類基準

```
Server Component (SC) にすべきもの:
- データフェッチのみを行い、インタラクションがないコンポーネント
- page.tsx（基本的にSC）
- 静的なレイアウト要素
- SEO に関わるコンテンツ表示

Client Component (CC) にすべきもの:
- useState, useEffect 等のフックを使うもの
- onClick, onChange 等のイベントハンドラがあるもの
- ブラウザAPIを使うもの（window, localStorage等）
- サードパーティのインタラクティブライブラリを使うもの
```

### 出力フォーマット

```
## SC / CC 分類
| ファイル | SC/CC | 理由 |
|---------|-------|------|
| page.tsx | SC | データフェッチ + レイアウト |
| user-page-header.tsx | SC | 静的表示のみ |
| user-table.tsx | CC | ソート・ページネーション操作 |
| user-filter-bar.tsx | CC | フォーム入力・フィルター操作 |
| user-create-modal.tsx | CC | フォーム・モーダル開閉状態 |
```

### 完了条件

- 全コンポーネントに SC/CC が割り当てられている
- 各分類に理由が記載されている

---

## Step 2-4: 共通コンポーネント vs feature固有コンポーネントの切り分け

### やること

- 他の feature でも使われそうなコンポーネントを特定する
- 共通コンポーネントの配置先を決定する

### 判定基準

```
共通にすべきもの:
- 3回以上使われる可能性があるUI部品
- feature のドメイン知識に依存しないもの
- Button, Modal, Table, Input 等の汎用UI

feature 固有にすべきもの:
- この feature のドメインモデルに強く依存するもの
- 他で再利用される可能性が低いもの
- ビジネスロジックを含むもの
```

### 出力フォーマット

```
## 共通 / feature固有 分類
| コンポーネント | 区分 | 理由 | 配置先 |
|--------------|------|------|--------|
| DataTable | 共通 | 汎用テーブル | src/components/ui/data-table/ |
| Modal | 共通 | 汎用モーダル | src/components/ui/modal/ |
| UserTable | feature固有 | User型に依存 | src/features/user-management/components/ |
| UserFilterBar | feature固有 | ユーザー固有のフィルター | src/features/user-management/components/ |
```

### 完了条件

- 全コンポーネントが共通 or feature固有に分類されている
- 共通コンポーネントの配置先が決定している

---

## Step 2-5: re-export 用 index.ts の設計

### やること

- 各ディレクトリの index.ts で何を export するかを決定する
- feature の公開API（外部から参照可能なもの）を確定する

### 設計ルール

```
1. feature/index.ts: 外部から使うもののみ export
   - ページで使うメインコンポーネント
   - 外部で使う型
   - 外部で使うフック

2. 内部ディレクトリの index.ts: feature 内部の整理用
   - components/index.ts: 全コンポーネントを re-export
   - types/index.ts: 全型を re-export
   - hooks/index.ts: 全フックを re-export

3. 非公開（feature 内部のみ）のものは index.ts に含めない
```

### 出力フォーマット

```
## re-export 設計

### src/features/user-management/index.ts
export { UserTable } from './components'
export { UserFilterBar } from './components'
export { UserCreateModal } from './components'
export { UserPageHeader } from './components'
export type { User, UserListResponse } from './types'
export { useUsers } from './hooks'
```

### 完了条件

- 全 index.ts の export 内容が決定している
- 公開 / 非公開の境界が明確

---

## Step 2-6: ファイルマップのユーザー確認

### やること

- Step 2-1 〜 2-5 の結果を統合して提示する
- ユーザーに確認を取る

### 確認ポイント

```
1. ファイル数は適切か（多すぎないか、少なすぎないか）
2. ディレクトリ構成はプロジェクトの既存構成と整合しているか
3. コンポーネント粒度は適切か
4. 命名は直感的か
```

### 完了条件

- ユーザーが **明示的に承認** した

---

## Phase 2 完了チェック

```
✅ 完全なファイルツリーが作成されている
✅ 各ファイルに1行説明がある
✅ 各ファイルに SC/CC の分類がついている
✅ 共通 / feature固有の切り分けが完了している
✅ re-export 設計が完了している
✅ ユーザーがファイルマップを承認した
✅ ここまでコードは一切書いていない
```

すべてOKなら → **Phase 3 へ進む**（ここからコードを書き始める）
