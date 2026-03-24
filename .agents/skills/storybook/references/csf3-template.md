# CSF3 基本テンプレート & meta 設定

Storybook v8 の Component Story Format 3 (CSF3) を使った Story の書き方。

---

## 最小テンプレート

```typescript
// components/ui/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',        // サイドバーの階層パス
  component: Button,          // autodocs の型情報源
  tags: ['autodocs'],         // Docs タブを自動生成
  parameters: {
    layout: 'centered',       // 'centered' | 'fullscreen' | 'padded'
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'ボタン',
  },
}
```

---

## meta の全設定項目

```typescript
const meta = {
  // ---- 必須 ----

  // サイドバーの表示パス（スラッシュ区切りで階層化）
  title: 'UI/Button',

  // コンポーネントへの参照（Props 自動推論・autodocs に必要）
  component: Button,

  // ---- 推奨 ----

  // autodocs タブを自動生成する
  tags: ['autodocs'],

  // コンポーネントを画面中央に配置（小さいコンポーネントに推奨）
  parameters: {
    layout: 'centered',  // または 'padded'（余白あり）| 'fullscreen'
  },

  // ArgTypes（詳細は argtypes.md を参照）
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },

  // ---- 任意 ----

  // サブコンポーネント（Compound Component の場合）
  subcomponents: { ButtonIcon },

  // story ファイル全体のデフォルト args
  args: {
    size: 'md',
  },
} satisfies Meta<typeof Button>
```

---

## `satisfies Meta<typeof Component>` を使う理由

```typescript
// ✅ satisfies を使う（推奨）
const meta = { ... } satisfies Meta<typeof Button>
type Story = StoryObj<typeof meta>

// args の型が Button の Props から自動推論される
export const Default: Story = {
  args: {
    children: 'ボタン',   // string 以外は型エラー
    variant: 'invalid',   // ← 型エラーになる（補完が効く）
  },
}

// ❌ as を使うと型推論が弱くなる
const meta = { ... } as Meta<typeof Button>
```

---

## title の命名パターン

```
UI/Button               → src/components/ui/ 配下
UI/Input
UI/Badge

Composite/FormField     → src/components/composite/ 配下
Composite/Select

Patterns/DataTable      → src/components/patterns/ 配下
Patterns/Pagination

Design System/Colors    → デザイントークンのカタログ
Design System/Typography
```

---

## layout パラメーターの使い分け

```typescript
// centered: 画面中央に表示（Button, Badge, Avatar など小さいコンポーネント）
parameters: { layout: 'centered' }

// padded: 余白あり（デフォルト。Card, FormField など中サイズ）
parameters: { layout: 'padded' }

// fullscreen: 画面全体（Header, Navigation, ページレイアウト）
parameters: { layout: 'fullscreen' }
```

---

## ストーリーの定義パターン

### 1. args を使う（最も一般的）

```typescript
export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
}
```

### 2. render 関数を使う（複数コンポーネントや複雑なレイアウト）

```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}
```

### 3. args + render の組み合わせ（args を render の中で使う）

```typescript
export const WithLabel: Story = {
  args: {
    label: '名前',
    placeholder: '山田 太郎',
  },
  render: (args) => (
    <div className="w-80">
      <FormField {...args} />
    </div>
  ),
}
```

---

## story レベルのパラメーター上書き

```typescript
// meta のパラメーターを特定のストーリーで上書きできる
export const Fullscreen: Story = {
  parameters: {
    layout: 'fullscreen',  // meta の 'centered' を上書き
    backgrounds: {
      default: 'dark',      // 背景色を変える
    },
    // Chromatic のスナップショット設定
    chromatic: {
      delay: 300,           // アニメーション後にスナップショット
      disableSnapshot: false,
    },
  },
}
```

---

## autodocs の活用

### JSDoc コメントが Docs ページに反映される

```typescript
interface ButtonProps {
  /** ボタンの外観スタイルを選択する */
  variant?: 'primary' | 'secondary' | 'outline'

  /** ローディング中かどうか。true のとき Spinner を表示し disabled になる */
  loading?: boolean
}
```

### MDX でカスタムドキュメントを書く場合

```mdx
{/* button.mdx */}
import { Meta, Canvas, Controls } from '@storybook/blocks'
import * as ButtonStories from './button.stories'

<Meta of={ButtonStories} />

# Button

クリック可能なアクションを表現する基本コンポーネント。

<Canvas of={ButtonStories.Default} />
<Controls of={ButtonStories.Default} />
```

---

## よくあるミス

```typescript
// ❌ export default を忘れる
const meta = { ... } satisfies Meta<typeof Button>
// export default が抜けているとサイドバーに表示されない

// ✅ 必ず export default する
export default meta

// ❌ Story 名を変数宣言せずに export する
export default {
  title: 'UI/Button',
  // ...
}
// → satisfies が使えず型推論が弱くなる

// ❌ type Story を定義せずに StoryObj を直接使う
export const Default: StoryObj<typeof Button> = { ... }
// → meta の args 型と Story の args 型が別々になる

// ✅ meta から型を引き継ぐ
type Story = StoryObj<typeof meta>
export const Default: Story = { ... }
```
