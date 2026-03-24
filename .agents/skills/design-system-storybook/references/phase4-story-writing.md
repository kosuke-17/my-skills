# Phase 4: コンポーネント実装 & Story 作成 — 詳細手順

コンポーネントの実装と Storybook の Story 作成を同時に進める。

---

## Step 4-1: 実装順序の決定

### 依存関係順の実装ルール

```
依存がないコンポーネントから実装する（ボトムアップ）

例:
  1. Spinner（依存なし）
  2. Icon（依存なし）
  3. Button（Spinner に依存）
  4. Input（依存なし）
  5. Label（依存なし）
  6. FormField（Input + Label に依存）
  7. Select（依存なし → 後に FormField に組み込まれる）
  8. DataTable（Button + Checkbox + Spinner に依存）
```

---

## Step 4-2: コンポーネント実装チェックリスト

各コンポーネントを実装する際に確認する項目:

```
□ Props 型定義（ComponentPropsWithoutRef を拡張）
□ バリアント定義（CVA / tailwind-variants）
□ 全バリアント・サイズの実装
□ ローディング状態の実装（該当する場合）
□ 無効（disabled）状態の実装
□ エラー状態の実装（フォーム系コンポーネント）
□ forwardRef の適用（DOM へのアクセスが必要な場合）
□ displayName の設定
□ アクセシビリティ対応:
  □ セマンティックな HTML 要素を使用
  □ aria-label / aria-describedby の対応（必要に応じて）
  □ role 属性（必要に応じて）
  □ キーボード操作（フォーカス管理）
□ className の merge（cn() を使用）
□ re-export（index.ts）
```

---

## Step 4-3: Story 作成 — CSF3 (Component Story Format 3) の基本

### 最小テンプレート

```typescript
// components/ui/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

// メタデータ（default export）
const meta = {
  title: 'UI/Button',             // サイドバーの階層パス
  component: Button,              // ドキュメント自動生成に使用
  tags: ['autodocs'],             // Docs タブを自動生成する
  parameters: {
    layout: 'centered',           // 'centered' | 'fullscreen' | 'padded'
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'ボタンの外観バリアント',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'ボタンのサイズ',
    },
    loading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    onClick: { action: 'clicked' },  // Actions パネルに記録
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// 各ストーリー（named export）
export const Default: Story = {
  args: {
    children: 'ボタン',
    variant: 'primary',
    size: 'md',
  },
}
```

### `satisfies` vs `as` の使い分け

```typescript
// ✅ satisfies を使う（型チェックが厳格になる・推奨）
const meta = { ... } satisfies Meta<typeof Button>

// これにより args の型が Component の Props から自動推論される
export const Default: Story = {
  args: {
    children: 'ボタン',  // string 以外を渡すと型エラー
  },
}
```

---

## Step 4-4: 全バリアント・状態のストーリー定義

### Button の全ストーリー例

```typescript
// --- バリアント別 ---
export const Primary: Story = {
  args: { children: 'Primary', variant: 'primary' },
}

export const Secondary: Story = {
  args: { children: 'Secondary', variant: 'secondary' },
}

export const Outline: Story = {
  args: { children: 'Outline', variant: 'outline' },
}

export const Ghost: Story = {
  args: { children: 'Ghost', variant: 'ghost' },
}

export const Destructive: Story = {
  args: { children: '削除', variant: 'destructive' },
}

// --- サイズ別 ---
export const Small: Story = {
  args: { children: 'Small', size: 'sm' },
}

export const Large: Story = {
  args: { children: 'Large', size: 'lg' },
}

// --- 状態別 ---
export const Loading: Story = {
  args: { children: '送信中...', loading: true },
}

export const Disabled: Story = {
  args: { children: '無効', disabled: true },
}

// --- 全バリアント一覧（比較用）---
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

// --- アイコン付き ---
export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button><PlusIcon className="h-4 w-4" />追加</Button>
      <Button variant="outline"><TrashIcon className="h-4 w-4" />削除</Button>
    </div>
  ),
}
```

### 状態網羅チェックリスト

全コンポーネントで必要なストーリー:

```
□ Default（デフォルト状態）
□ 全バリアント（variant × size の代表的な組み合わせ）
□ Disabled（無効状態）
□ Loading（ローディング状態）※ 該当するコンポーネントのみ
□ Error（エラー状態）※ フォーム系コンポーネント
□ AllVariants（全バリアント一覧・比較用）
□ WithIcon（アイコン付き）※ 該当するコンポーネントのみ
□ LongText（長いテキスト時の表示）※ テキストが可変のコンポーネント
```

---

## Step 4-5: ArgTypes と Controls の活用

### ArgTypes の設定方法

```typescript
argTypes: {
  // 選択肢がある場合: select / radio
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
    description: 'ボタンの外観',
    table: {
      type: { summary: 'ButtonVariant' },
      defaultValue: { summary: 'primary' },
    },
  },

  // 真偽値: boolean
  disabled: {
    control: 'boolean',
    description: '無効状態にする',
  },

  // テキスト: text
  children: {
    control: 'text',
    description: 'ボタンのラベル',
  },

  // 数値: number
  maxLength: {
    control: { type: 'number', min: 0, max: 1000, step: 10 },
  },

  // 色: color
  backgroundColor: {
    control: 'color',
  },

  // 非表示にしたい props（HTMLの標準属性等）
  className: { table: { disable: true } },
  style:     { table: { disable: true } },
  ref:       { table: { disable: true } },
}
```

---

## Step 4-6: play 関数によるインタラクションテスト

### 基本テンプレート

```typescript
import { expect, fn, userEvent, within } from '@storybook/test'

export const ClickTest: Story = {
  args: {
    children: 'クリック',
    onClick: fn(),  // モック関数
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: 'クリック' })

    // クリック
    await userEvent.click(button)

    // アサーション
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}
```

### フォーム入力のインタラクションテスト

```typescript
export const FormSubmit: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 入力フィールドを取得してタイプ
    const emailInput = canvas.getByLabelText('メールアドレス')
    await userEvent.type(emailInput, 'user@example.com')

    const passwordInput = canvas.getByLabelText('パスワード')
    await userEvent.type(passwordInput, 'password123')

    // フォームを送信
    const submitButton = canvas.getByRole('button', { name: '送信' })
    await userEvent.click(submitButton)

    // 成功メッセージの確認
    await expect(canvas.getByText('送信されました')).toBeInTheDocument()
  },
}
```

### Dialog の開閉テスト

```typescript
export const DialogOpenClose: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Dialog を開く
    await userEvent.click(canvas.getByRole('button', { name: '開く' }))

    // Dialog が表示されていることを確認
    const dialog = canvas.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // 閉じる
    await userEvent.keyboard('{Escape}')
    await expect(dialog).not.toBeInTheDocument()
  },
}
```

---

## Step 4-7: Decorator パターン集

### Context Provider が必要な場合

```typescript
// 特定のストーリーだけ Provider を追加
export const WithTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
}

// meta に設定してファイル全体に適用
const meta = {
  decorators: [
    (Story) => (
      <div className="p-8 bg-bg-secondary">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Component>
```

### ルーティングが必要な場合（Next.js）

```typescript
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'

export const WithRouter: Story = {
  decorators: [
    (Story) => (
      <RouterContext.Provider value={mockRouter}>
        <Story />
      </RouterContext.Provider>
    ),
  ],
}
```

---

## Step 4-8: ストーリー命名規則

```
✅ 良い命名
Default          → デフォルト状態（必ず作る）
Primary          → variant="primary" の状態
Loading          → ローディング状態
Disabled         → 無効状態
WithError        → エラー表示あり
AllVariants      → 全バリアントの一覧
LongContent      → 長いテキスト時の挙動

❌ 悪い命名
Test1            → 何のテストか不明
ButtonPrimary    → コンポーネント名を繰り返さない
button_primary   → PascalCase を使う
```

---

## Phase 4 完了チェック

```
✅ 全コンポーネントが実装されている
✅ 各コンポーネントに Story ファイルが存在する
✅ Default ストーリーがある
✅ 全バリアント・全状態のストーリーが揃っている
✅ ArgTypes と Controls が設定されている
✅ tags: ['autodocs'] が設定されている
✅ Storybook 上でエラーなく表示される
✅ アクセシビリティ対応（aria 属性、キーボード操作）が実装されている
```

すべてOKなら → **Phase 5 へ進む**
