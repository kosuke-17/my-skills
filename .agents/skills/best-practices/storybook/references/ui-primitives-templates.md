# UIプリミティブ — Storyテンプレート集

Button / Input / Select / Checkbox / Badge の CSF3 テンプレート。
コンポーネントの実際の Props に合わせて変数名・option値・description を調整して使用すること。

---

## テンプレートの使い方

1. コンポーネントファイルを読んで Props / variant / size の実際の値を確認する
2. 対応するテンプレートをコピーする
3. `import` パス、`options` の値、`description` をコンポーネントに合わせて書き換える
4. [story-checklist.md](story-checklist.md) でカバレッジを確認する

---

## Button テンプレート

```typescript
// components/ui/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'ボタンの外観バリアント',
      table: {
        type: { summary: 'ButtonVariant' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'ボタンのサイズ',
      table: {
        type: { summary: 'ButtonSize' },
        defaultValue: { summary: 'md' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'ローディング状態（スピナー表示・クリック不可）',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    children: {
      control: 'text',
      description: 'ボタンのラベルテキスト',
    },
    onClick: { action: 'clicked' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// --- 基本 ---
export const Default: Story = {
  args: {
    children: 'ボタン',
    variant: 'primary',
    size: 'md',
  },
}

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
  args: { children: '削除する', variant: 'destructive' },
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
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

// --- サイズ一覧（比較用）---
export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}
```

---

## Input テンプレート

```typescript
// components/ui/input/input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'inputのtype属性',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    error: {
      control: 'boolean',
      description: 'エラー状態（赤枠表示）',
    },
    errorMessage: {
      control: 'text',
      description: 'エラーメッセージテキスト',
    },
    value: {
      control: 'text',
      description: '入力値（制御コンポーネントの場合）',
    },
    onChange: { action: 'changed' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'テキストを入力',
    type: 'text',
  },
}

export const WithValue: Story = {
  args: {
    value: '入力済みのテキスト',
    type: 'text',
  },
}

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'パスワードを入力',
  },
}

export const WithError: Story = {
  args: {
    value: 'invalid-email',
    type: 'email',
    error: true,
    errorMessage: '有効なメールアドレスを入力してください',
  },
}

export const Disabled: Story = {
  args: {
    value: '編集不可のテキスト',
    disabled: true,
  },
}
```

---

## Select テンプレート

```typescript
// components/ui/select/select.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Select, SelectItem } from './select'

const sampleOptions = [
  { value: 'option1', label: 'オプション1' },
  { value: 'option2', label: 'オプション2' },
  { value: 'option3', label: 'オプション3' },
]

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'プレースホルダーテキスト',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    error: {
      control: 'boolean',
      description: 'エラー状態',
    },
    errorMessage: {
      control: 'text',
      description: 'エラーメッセージ',
    },
    onValueChange: { action: 'valueChanged' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      {sampleOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  ),
  args: {
    placeholder: '選択してください',
  },
}

export const WithValue: Story = {
  render: (args) => (
    <Select {...args} defaultValue="option1">
      {sampleOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  ),
}

export const WithError: Story = {
  render: (args) => (
    <Select {...args}>
      {sampleOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  ),
  args: {
    placeholder: '選択してください',
    error: true,
    errorMessage: '選択は必須です',
  },
}

export const Disabled: Story = {
  render: (args) => (
    <Select {...args}>
      {sampleOptions.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  ),
  args: {
    placeholder: '選択できません',
    disabled: true,
  },
}
```

---

## Checkbox テンプレート

```typescript
// components/ui/checkbox/checkbox.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'チェック状態',
    },
    indeterminate: {
      control: 'boolean',
      description: '中間状態（一部選択時に使用）',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    label: {
      control: 'text',
      description: 'ラベルテキスト',
    },
    onCheckedChange: { action: 'checkedChanged' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'チェックボックス',
  },
}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'チェック済み',
  },
}

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
    label: '一部選択（中間状態）',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: '無効状態',
  },
}

export const CheckedDisabled: Story = {
  args: {
    checked: true,
    disabled: true,
    label: 'チェック済み・無効',
  },
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="未チェック" />
      <Checkbox checked label="チェック済み" />
      <Checkbox indeterminate label="中間状態" />
      <Checkbox disabled label="無効（未チェック）" />
      <Checkbox checked disabled label="無効（チェック済み）" />
    </div>
  ),
}
```

---

## Badge テンプレート

```typescript
// components/ui/badge/badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
      description: 'バッジの色バリアント',
      table: {
        type: { summary: 'BadgeVariant' },
        defaultValue: { summary: 'default' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'バッジのサイズ',
      table: {
        type: { summary: 'BadgeSize' },
        defaultValue: { summary: 'md' },
      },
    },
    children: {
      control: 'text',
      description: 'バッジのテキスト',
    },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
}

export const Success: Story = {
  args: { children: '成功', variant: 'success' },
}

export const Warning: Story = {
  args: { children: '警告', variant: 'warning' },
}

export const Error: Story = {
  args: { children: 'エラー', variant: 'error' },
}

export const Info: Story = {
  args: { children: '情報', variant: 'info' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
    </div>
  ),
}
```

---

## 新しいコンポーネントにテンプレートを適用する手順

上記以外のUIプリミティブにテンプレートを適用する場合:

1. **コンポーネントのPropsを確認する**
   - TypeScriptの型定義を読む
   - variant / size / state系のPropsを洗い出す

2. **最も近いテンプレートを選ぶ**
   - variant / size がある → Button テンプレート
   - テキスト入力系 → Input テンプレート
   - フラグ（ON/OFF）系 → Checkbox テンプレート
   - ステータス表示系 → Badge テンプレート

3. **テンプレートをカスタマイズする**
   - `component` を実際のコンポーネントに変更
   - `title` をコンポーネント名に合わせる
   - `argTypes` の `options` / `description` を実際のPropsに合わせる
   - 各Storyの `args` 値を実際の値に調整する

4. **[story-checklist.md](story-checklist.md) でカバレッジを確認する**
