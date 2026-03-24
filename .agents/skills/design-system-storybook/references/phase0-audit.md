# Phase 0: 現状把握 & 要件定義 — 詳細手順

デザインシステム構築の前に、プロジェクトの現状を正確に把握しスコープを確定する。

---

## Step 0-1: プロジェクトの技術スタック確認

### 確認項目

```
フレームワーク:
□ React (CRA / Vite / Next.js)
□ Vue 3
□ Svelte
□ その他

言語:
□ TypeScript (strict mode 有無)
□ JavaScript

スタイリング:
□ Tailwind CSS (バージョン確認)
□ CSS Modules
□ styled-components / emotion (CSS-in-JS)
□ Sass / SCSS
□ Vanilla CSS
□ 複合（例: Tailwind + CSS変数）

パッケージマネージャー:
□ pnpm
□ npm
□ yarn

ビルドツール:
□ Vite
□ webpack
□ Turbopack
```

### 完了条件

- 技術スタックが一覧化されている

---

## Step 0-2: 既存UIライブラリ・デザインシステムの棚卸し

### 確認項目

```
UIライブラリ:
□ shadcn/ui
□ Radix UI (プリミティブ)
□ Headless UI
□ MUI (Material UI)
□ Chakra UI
□ Ant Design
□ 独自ライブラリ
□ なし

既存コンポーネント:
□ Button 系
□ Form 系 (Input, Select, Checkbox, Radio, etc.)
□ Overlay 系 (Modal, Drawer, Tooltip, etc.)
□ Navigation 系 (Tabs, Breadcrumb, Sidebar, etc.)
□ Feedback 系 (Toast, Alert, Badge, etc.)
□ Layout 系 (Grid, Card, Divider, etc.)
□ Data Display 系 (Table, List, Avatar, etc.)

既存のスタイルガイド・デザイントークン:
□ CSS変数が定義されているか
□ Figma / Sketch のデザインデータがあるか
□ 既存のカラーパレット定義があるか
□ 既存のタイポグラフィ定義があるか
```

### 出力フォーマット

```
## 既存UI資産
- UIライブラリ: shadcn/ui (v2)
- 既存コンポーネント数: 12個
- 既存トークン: CSS変数あり（colors, spacing 定義済み）
- デザインデータ: Figma ファイルあり
- 不足コンポーネント: DataTable, Pagination, Timeline
```

### 完了条件

- 既存の UI 資産が把握されている
- 不足しているものが特定されている

---

## Step 0-3: デザインツール連携の確認

### 確認項目

```
□ Figma を使用しているか
□ Figma と開発の間でトークンを同期しているか
  （Figma Tokens / Style Dictionary / Token Studio 等）
□ デザインカンプとコンポーネントの命名を合わせる必要があるか
□ Figma のコンポーネント名をそのままコードに反映するか
```

### 判断フロー

```
Figma あり + トークン同期ツールあり
  → Style Dictionary や token-pipeline の設定を確認する
  → Phase 1 でトークン定義の自動生成を検討する

Figma あり + トークン同期なし
  → Figma の値を手動でトークンに起こす
  → Phase 1 で定義フォーマットを慎重に設計する

Figma なし
  → コードファーストでトークンを設計する
```

### 完了条件

- デザインツール連携方針が決まっている

---

## Step 0-4: 対象スコープの確定

### スコープ選択

```
A. 新規構築
   → Phase 0 → 1 → 2 → 3 → 4 → 5 の全フェーズを実行

B. 既存デザインシステムへの拡張
   → Phase 0 で既存資産を把握した上で
   → 変更が必要なフェーズのみ実行

C. Storybook の新規導入（コンポーネントは既存）
   → Phase 3 から開始
   → 既存コンポーネントに Story を追加 (Phase 4)

D. デザイントークンの整備のみ
   → Phase 1 のみ実行

E. ビジュアルテスト・ドキュメント整備
   → Phase 5 のみ実行
```

### 完了条件

- スコープ A〜E のいずれかが確定している

---

## Step 0-5: コンポーネント初期一覧の作成

### やること

- 今回の作業で対象とするコンポーネントの一覧を作成する
- 優先度を設定する（高 / 中 / 低）

### 出力フォーマット

```
## 対象コンポーネント一覧

### Atoms（基本UI部品）
| # | コンポーネント | 優先度 | 備考 |
|---|-------------|--------|------|
| 1 | Button | 高 | バリアント: primary/secondary/outline/ghost/destructive |
| 2 | Input | 高 | バリアント: default/error/disabled |
| 3 | Label | 高 | |
| 4 | Badge | 中 | |
| 5 | Avatar | 中 | |
| 6 | Icon | 中 | lucide-react を使用 |
| 7 | Spinner | 中 | |
| 8 | Skeleton | 低 | |

### Molecules（複合UI部品）
| # | コンポーネント | 優先度 | 備考 |
|---|-------------|--------|------|
| 1 | FormField | 高 | Label + Input + ErrorMessage |
| 2 | Select | 高 | |
| 3 | Checkbox | 高 | |
| 4 | Dialog | 中 | |
| 5 | Toast | 中 | |
| 6 | Tooltip | 中 | |

### Organisms（機能的UI部品）
| # | コンポーネント | 優先度 | 備考 |
|---|-------------|--------|------|
| 1 | DataTable | 中 | ソート・ページネーション対応 |
| 2 | Pagination | 中 | |
| 3 | NavigationMenu | 低 | |
```

### 完了条件

- 対象コンポーネントの一覧が作成されている
- 優先度が設定されている

---

## Step 0-6: 要件サマリーのユーザー確認

### 出力フォーマット

```
## デザインシステム要件サマリー

### プロジェクト概要
- フレームワーク: React + TypeScript (Vite)
- スタイリング: Tailwind CSS v4
- パッケージマネージャー: pnpm

### 既存資産
- UIライブラリ: shadcn/ui ベース
- 既存トークン: あり（一部）
- デザインデータ: Figma あり（トークン同期なし）

### 対象スコープ
スコープ A: 新規構築（既存の shadcn/ui を土台に拡張）

### 対象コンポーネント
- Atoms: 8個
- Molecules: 6個
- Organisms: 3個
- 合計: 17個（今回の作業対象）

### ダークモード対応
あり（CSS変数を使ったカラースキーム切り替え）

### スコープ外
- モバイルアプリ用コンポーネント
- アニメーションライブラリの構築
```

### 完了条件

- 要件サマリーが作成されている
- ユーザーが承認した

---

## Phase 0 完了チェック

```
✅ 技術スタックが確定している
✅ 既存UI資産の棚卸しが完了している
✅ デザインツール連携方針が決まっている
✅ 対象スコープが確定している
✅ コンポーネント初期一覧が作成されている
✅ ユーザーが要件サマリーを承認した
```

すべてOKなら → **Phase 1 へ進む**
