# Storybookベストプラクティス

React + TypeScript + Storybook v8 (CSF3) における Story 作成のベストプラクティスとアンチパターン集。

---

## 1. CSF3形式の基本ルール

### Meta定義

```typescript
// ✅ 良い例: satisfies を使って型安全に定義
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>
```

```typescript
// ❌ 悪い例: as const / 型なしは推奨しない
const meta: Meta = {
  title: 'Button',
  component: Button,
}
export default meta
```

### `satisfies` を使う理由

- `Story` 型の `args` が `Button` の Props から自動推論される
- 存在しない Props を渡すと型エラーになる
- IDEの補完が正確に効く

---

## 2. titleの命名規則

```typescript
// ✅ 良い例: スラッシュで階層を表現
title: 'UI/Button'          // atoms レベル
title: 'UI/Form/Input'      // フォーム系
title: 'Composite/Card'     // molecules レベル
title: 'Patterns/Navigation' // organisms レベル

// ❌ 悪い例
title: 'button'             // 小文字はNG
title: 'Components/Button'  // "Components" は冗長
title: 'ButtonComponent'    // 階層なしは管理しづらい
```

---

## 3. tags: ['autodocs'] の設定

```typescript
// ✅ 必ず設定する — Docs タブの自動生成に必要
const meta = {
  tags: ['autodocs'],
  ...
} satisfies Meta<typeof Button>

// ❌ 省略するとDocsタブが生成されない
const meta = {
  component: Button,
  // tags なし
}
```

---

## 4. parameters.layout の設定

```typescript
// コンポーネントに応じて選択する
parameters: {
  layout: 'centered',    // ✅ ほとんどのUIコンポーネント（デフォルト推奨）
  layout: 'fullscreen',  // ✅ ページレイアウト・ナビゲーション・全幅コンポーネント
  layout: 'padded',      // ✅ コンテナ幅が重要なコンポーネント（Card等）
}
```

---

## 5. ArgTypes の設定

ArgTypesはControlsパネルとドキュメントの品質を決定する重要な設定。

```typescript
argTypes: {
  // select — 選択肢がある Props
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    description: 'ボタンの外観バリアント',
    table: {
      type: { summary: 'ButtonVariant' },
      defaultValue: { summary: 'primary' },
    },
  },

  // boolean — フラグ系 Props
  disabled: {
    control: 'boolean',
    description: '無効状態にする',
  },

  // text — 文字列 Props
  children: {
    control: 'text',
    description: 'ボタンのラベルテキスト',
  },

  // number — 数値 Props
  maxLength: {
    control: { type: 'number', min: 0, max: 1000, step: 1 },
    description: '入力文字数の上限',
  },

  // 非表示にすべき Props（HTML標準属性等）
  className: { table: { disable: true } },
  style:     { table: { disable: true } },
  ref:       { table: { disable: true } },

  // コールバックはactionとして記録
  onClick:   { action: 'clicked' },
  onChange:  { action: 'changed' },
}
```

---

## 6. ストーリー命名規則

```typescript
// ✅ 良い命名 — PascalCase + 状態を表す名前
export const Default: Story = { ... }         // 必須: デフォルト状態
export const Primary: Story = { ... }         // variant="primary"
export const Secondary: Story = { ... }       // variant="secondary"
export const Loading: Story = { ... }         // ローディング状態
export const Disabled: Story = { ... }        // 無効状態
export const WithError: Story = { ... }       // エラー表示
export const AllVariants: Story = { ... }     // 全バリアント比較
export const LongContent: Story = { ... }     // 長いテキスト時

// ❌ 悪い命名
export const test1: Story = { ... }           // 何の状態か不明 + camelCase
export const ButtonPrimary: Story = { ... }   // コンポーネント名を繰り返す
export const button_primary: Story = { ... }  // snake_case はNG
export const Story1: Story = { ... }          // 意味がない
```

---

## 7. AllVariants story パターン

全バリアントを一覧で比較できるStoryは必ず作成する。

```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}
```

---

## 8. Play関数によるインタラクションテスト

```typescript
import { expect, fn, userEvent, within } from '@storybook/test'

// ✅ 基本パターン
export const ClickTest: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: /クリック/i })

    await userEvent.click(button)

    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

// ✅ step() でテストを論理ブロックに分割（複雑なインタラクション）
export const FormInteraction: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('フォームに入力する', async () => {
      await userEvent.type(canvas.getByLabelText('メール'), 'user@example.com')
      await userEvent.type(canvas.getByLabelText('パスワード'), 'password123')
    })

    await step('フォームを送信する', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '送信' }))
    })

    await step('成功メッセージを確認する', async () => {
      await expect(canvas.getByText('送信されました')).toBeInTheDocument()
    })
  },
}
```

---

## 9. Decorator パターン

```typescript
// ✅ 特定のStoryにProvider等を追加
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" className="p-8">
        <Story />
      </div>
    ),
  ],
}

// ✅ meta に設定してファイル全体に適用
const meta = {
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Component>
```

---

## 10. アンチパターン集

### ❌ Default storyがない

```typescript
// ❌ Defaultがないと新規参入者が基本的な使い方を把握できない
export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
// Defaultがない!

// ✅ 必ずDefaultを作る
export const Default: Story = {
  args: { children: 'ボタン', variant: 'primary', size: 'md' },
}
```

### ❌ ArgsではなくrenderにPropsをハードコード

```typescript
// ❌ Controlsが効かない
export const Primary: Story = {
  render: () => <Button variant="primary">Primary</Button>,
}

// ✅ args を使う
export const Primary: Story = {
  args: { variant: 'primary', children: 'Primary' },
}
```

### ❌ 状態のみのテストでrenderを多用

```typescript
// ❌ 全ストーリーにrenderを書くのは冗長
export const AllButtons: Story = {
  render: () => (
    <>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </>
  ),
}
// これはAllVariantsだけでよい。各バリアントはargsで表現する。
```

### ❌ `title` にコンポーネント名と違う名前を使う

```typescript
// ❌ コンポーネント名と一致しないtitleは混乱を招く
// ファイル: badge.stories.tsx
const meta = { title: 'UI/Tag', component: Badge }  // Tagは混乱する

// ✅ コンポーネント名に合わせる
const meta = { title: 'UI/Badge', component: Badge }
```

### ❌ import元が間違っている

```typescript
// ❌ ファイルパスが深くなりがちな直接import
import { Button } from '../../components/ui/button/button'

// ✅ index.ts経由でimport (barrel export)
import { Button } from './button'        // 同ディレクトリの場合
import { Button } from '@/components/ui' // パスエイリアス使用
```

---

## 11. アクセシビリティ対応

```typescript
// ✅ セマンティックなHTML + aria属性を使う
// Storybook a11y addonでチェックできる

// アイコンのみのボタンは aria-label を必須とする
export const IconOnly: Story = {
  render: () => (
    <Button aria-label="設定を開く">
      <SettingsIcon className="h-4 w-4" />
    </Button>
  ),
}
```

---

## 参照

詳細なテンプレートは以下を参照:
- UIプリミティブのテンプレート → [ui-primitives-templates.md](ui-primitives-templates.md)
- Story品質チェックリスト → [story-checklist.md](story-checklist.md)
