# Phase 5: 共通コンポーネント / UI部品 — 詳細手順

feature コンポーネント実装の前に、再利用可能なUI部品を先に整備する。

---

## Step 5-1: 既存の共通コンポーネントライブラリの確認

### やること

- プロジェクトに既存のUIライブラリ（shadcn/ui, MUI, Chakra 等）があるか確認する
- 既存の共通コンポーネント（src/components/ui/ 等）を棚卸しする

### 確認項目

```
1. UIライブラリ:
   □ shadcn/ui
   □ MUI (Material UI)
   □ Chakra UI
   □ Radix UI (プリミティブ)
   □ Headless UI
   □ 独自UIライブラリ
   □ なし

2. 既存共通コンポーネント一覧:
   - Button: ある / ない
   - Input: ある / ない
   - Select: ある / ない
   - Modal/Dialog: ある / ない
   - Table: ある / ない
   - Toast/Notification: ある / ない
   - Loading/Skeleton: ある / ない
   - Pagination: ある / ない
   - Form系 (Label, FormField, etc.): ある / ない
```

### 出力フォーマット

```
## 既存UI資産
- UIライブラリ: shadcn/ui
- 既存コンポーネント: Button, Input, Select, Dialog, Toast
- 不足コンポーネント: DataTable, Skeleton, Pagination
```

### 完了条件

- 既存のUI資産が把握されている
- 不足するコンポーネントが特定されている

---

## Step 5-2: 新規共通コンポーネントの洗い出し

### やること

- Phase 2 の「共通コンポーネント」リストと Step 5-1 の「不足リスト」を突合する
- 今回新規に作成が必要な共通コンポーネントを確定する

### 判断フロー

```
既存ライブラリにある → そのまま使う → 新規作成不要
既存ライブラリにあるが拡張が必要 → ラッパーコンポーネントを作成
既存ライブラリにない → 新規作成
```

### 出力フォーマット

```
## 新規作成が必要な共通コンポーネント
| # | コンポーネント | 方針 | 理由 |
|---|--------------|------|------|
| 1 | DataTable | 新規作成 | 汎用テーブルが存在しない |
| 2 | Pagination | 新規作成 | ページネーションUIが存在しない |
| 3 | ConfirmDialog | ラッパー | Dialog はあるが確認ダイアログパターンがない |
| 4 | EmptyState | 新規作成 | 空状態の共通表示がない |
| 5 | SearchInput | ラッパー | Input にデバウンス + アイコンを追加 |
```

### 完了条件

- 作成が必要な共通コンポーネントの一覧が確定している

---

## Step 5-3: 各コンポーネントのインターフェース設計（Props）

### やること

- 新規作成する各共通コンポーネントの Props を設計する
- Phase 3 の型定義と整合させる

### 設計原則

```
1. ジェネリクスで型パラメータを受け取れるようにする（DataTable<T> 等）
2. 制御 / 非制御の両方をサポートする（可能な場合）
3. HTML標準属性を extends する（React.ComponentPropsWithoutRef<'div'> 等）
4. コンポジションパターンを優先する（モノリシックな props より子コンポーネント分割）
5. アクセシビリティに必要な props を含める（aria-label 等）
```

### 出力フォーマット（例: DataTable）

```typescript
// 型パラメータでデータ型を受け取る
interface DataTableProps<T> {
  // データ
  data: T[]
  columns: ColumnDef<T>[]

  // ソート
  sortConfig?: SortConfig
  onSortChange?: (config: SortConfig) => void

  // 選択
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  getRowId: (row: T) => string

  // 状態
  isLoading?: boolean
  emptyMessage?: string

  // スタイル
  className?: string

  // アクセシビリティ
  'aria-label': string
}

interface ColumnDef<T> {
  key: string
  header: string
  sortable?: boolean
  width?: string
  render: (row: T) => React.ReactNode
}
```

### 完了条件

- 全新規コンポーネントの Props インターフェースが設計されている
- ジェネリクス・拡張性が考慮されている

---

## Step 5-4: コンポーネント実装（見た目 + 基本動作）

### やること

- 各共通コンポーネントを実装する
- まず基本的な見た目と動作を実装する

### 実装順序

```
1. 依存関係がないコンポーネントから実装する
2. 他のコンポーネントに依存するものは後から実装する
   例: DataTable → ColumnHeader → Pagination の順で依存している場合、
   Pagination → ColumnHeader → DataTable の順に実装する
```

### 実装チェックリスト（各コンポーネントごと）

```
□ 'use client' ディレクティブ（必要な場合）
□ Props の型定義（import or inline）
□ デフォルト props の設定
□ JSX 構造の実装
□ スタイリングの適用
□ 基本的なイベントハンドラ
□ ref の転送（forwardRef、必要な場合）
□ displayName の設定
□ export の確認
```

### 完了条件

- 各コンポーネントの基本実装が完了している
- 単体で動作確認可能な状態

---

## Step 5-5: バリアント・サイズ・状態の網羅

### やること

- 各コンポーネントのバリエーションを実装する

### 確認項目（各コンポーネントごと）

```
バリアント:
□ primary / secondary / outline / ghost 等のスタイルバリアント
□ サイズバリアント（sm / md / lg）

状態:
□ デフォルト状態
□ ホバー状態
□ フォーカス状態
□ アクティブ / 押下状態
□ 無効状態（disabled）
□ ローディング状態
□ エラー状態

レスポンシブ:
□ モバイル表示
□ タブレット表示
□ デスクトップ表示
```

### 完了条件

- 必要なバリアントが全て実装されている
- 全状態が視覚的に確認可能

---

## Step 5-6: Storybook / プレビュー用の確認

### やること

- 実装したコンポーネントを視覚的に確認する
- Storybook がある場合は Story を作成する
- ない場合は簡易プレビューで確認する

### 確認項目

```
□ 全バリアントが正しく表示される
□ インタラクション（クリック、入力等）が動作する
□ レスポンシブが正しく機能する
□ アクセシビリティ（キーボード操作、スクリーンリーダー）が機能する
□ Props の型が正しく推論される
```

### 完了条件

- 視覚的に動作確認が完了している

---

## Phase 5 完了チェック

```
✅ Phase 6 で必要な共通コンポーネントがすべて実装済み
✅ Props が Phase 3 の型定義と整合している
✅ 全バリアント・状態が実装されている
✅ アクセシビリティが考慮されている
```

すべてOKなら → **Phase 6 へ進む**
