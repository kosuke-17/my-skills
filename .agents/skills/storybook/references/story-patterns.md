# コンポーネント種別ごとのストーリーテンプレート

コンポーネントの種類に応じたコピー可能なテンプレート集。

---

## Button（ボタン）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, fn, userEvent, within } from '@storybook/test'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } },
    },
    loading:   { control: 'boolean' },
    disabled:  { control: 'boolean' },
    children:  { control: 'text' },
    onClick:   { action: 'clicked' },
    className: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'ボタン' },
}
export const Primary:     Story = { args: { children: 'Primary',   variant: 'primary'     } }
export const Secondary:   Story = { args: { children: 'Secondary', variant: 'secondary'   } }
export const Outline:     Story = { args: { children: 'Outline',   variant: 'outline'     } }
export const Ghost:       Story = { args: { children: 'Ghost',     variant: 'ghost'       } }
export const Destructive: Story = { args: { children: '削除',      variant: 'destructive' } }
export const Small:       Story = { args: { children: 'Small',     size: 'sm'             } }
export const Large:       Story = { args: { children: 'Large',     size: 'lg'             } }
export const Loading:     Story = { args: { children: '送信中...', loading: true          } }
export const Disabled:    Story = { args: { children: '無効',      disabled: true         } }

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

export const ClickTest: Story = {
  args: { children: 'クリック', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'クリック' }))
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}
```

---

## Input（テキスト入力）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { Input } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'search'],
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: { control: 'text' },
    disabled:    { control: 'boolean' },
    error:       { control: 'boolean', description: 'エラー状態' },
    className:   { table: { disable: true } },
    ref:         { table: { disable: true } },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default:  Story = { args: { placeholder: 'テキストを入力' } }
export const Email:    Story = { args: { type: 'email',    placeholder: 'user@example.com' } }
export const Password: Story = { args: { type: 'password', placeholder: 'パスワード' } }
export const WithError: Story = {
  args: { placeholder: 'テキストを入力', error: true, defaultValue: '不正な値' },
}
export const Disabled: Story = { args: { placeholder: '入力不可', disabled: true } }

export const TypeTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    await userEvent.type(input, 'hello world')
    await expect(input).toHaveValue('hello world')
  },
}
```

---

## FormField（ラベル + 入力 + エラーメッセージ）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { FormField } from './form-field'

const meta = {
  title: 'Composite/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'メールアドレス',
    placeholder: 'user@example.com',
    type: 'email',
  },
}
export const Required: Story = {
  args: {
    label: 'メールアドレス',
    placeholder: 'user@example.com',
    required: true,
  },
}
export const WithError: Story = {
  args: {
    label: 'メールアドレス',
    placeholder: 'user@example.com',
    errorMessage: '有効なメールアドレスを入力してください',
  },
}
export const WithHelperText: Story = {
  args: {
    label: 'パスワード',
    type: 'password',
    helperText: '8文字以上で入力してください',
  },
}
export const Disabled: Story = {
  args: {
    label: 'メールアドレス',
    value: 'user@example.com',
    disabled: true,
  },
}
```

---

## Select / Combobox（セレクトボックス）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const meta = {
  title: 'Composite/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  children: (
    <>
      <SelectTrigger>
        <SelectValue placeholder="選択してください" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">りんご</SelectItem>
        <SelectItem value="banana">バナナ</SelectItem>
        <SelectItem value="orange">オレンジ</SelectItem>
      </SelectContent>
    </>
  ),
}

export const Default:     Story = { render: () => <Select>{defaultArgs.children}</Select> }
export const WithValue:   Story = { render: () => <Select defaultValue="banana">{defaultArgs.children}</Select> }
export const Disabled:    Story = { render: () => <Select disabled>{defaultArgs.children}</Select> }

export const OpenAndSelect: Story = {
  render: () => <Select>{defaultArgs.children}</Select>,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('ドロップダウンを開く', async () => {
      await userEvent.click(canvas.getByRole('combobox'))
      await expect(canvas.getByRole('listbox')).toBeVisible()
    })

    await step('オプションを選択する', async () => {
      await userEvent.click(canvas.getByRole('option', { name: 'バナナ' }))
      await expect(canvas.getByRole('combobox')).toHaveTextContent('バナナ')
    })
  },
}
```

---

## Dialog / Modal（ダイアログ）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within, waitFor } from '@storybook/test'
import { Button } from '../button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog'

const meta = {
  title: 'Composite/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

// 開いた状態（デフォルト表示）
export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ダイアログタイトル</DialogTitle>
        </DialogHeader>
        <p>ダイアログの本文が入ります。</p>
      </DialogContent>
    </Dialog>
  ),
}

// トリガーから開く
export const WithTrigger: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認</DialogTitle>
        </DialogHeader>
        <p>この操作を実行してもよいですか？</p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline">キャンセル</Button>
          <Button>実行</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('ダイアログを開く', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'ダイアログを開く' }))
      await expect(canvas.getByRole('dialog')).toBeVisible()
    })

    await step('Escape で閉じる', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => {
        expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  },
}
```

---

## Toast / Notification（通知）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { Button } from '../button'
import { Toaster } from './toaster'
import { useToast } from './use-toast'

// Toast はトリガーが必要なため、ラッパーコンポーネントを使う
const ToastDemo = ({ variant }: { variant?: 'default' | 'destructive' }) => {
  const { toast } = useToast()
  return (
    <div>
      <Button
        onClick={() =>
          toast({
            title: variant === 'destructive' ? 'エラー' : '完了',
            description: variant === 'destructive'
              ? '処理に失敗しました'
              : '処理が完了しました',
            variant,
          })
        }
      >
        Toast を表示
      </Button>
      <Toaster />
    </div>
  )
}

const meta = {
  title: 'Composite/Toast',
  component: ToastDemo,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ToastDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default:     Story = { args: {} }
export const Destructive: Story = { args: { variant: 'destructive' } }

export const ShowToast: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Toast を表示' }))
    await expect(canvas.getByText('完了')).toBeInTheDocument()
  },
}
```

---

## DataTable（データテーブル）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './data-table'
import type { ColumnDef } from './data-table'

type User = { id: string; name: string; email: string; role: string }

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name',  header: '名前' },
  { accessorKey: 'email', header: 'メールアドレス' },
  { accessorKey: 'role',  header: '役職' },
]

const users: User[] = [
  { id: '1', name: '山田 太郎', email: 'yamada@example.com', role: 'エンジニア' },
  { id: '2', name: '鈴木 花子', email: 'suzuki@example.com', role: 'デザイナー' },
  { id: '3', name: '田中 一郎', email: 'tanaka@example.com', role: 'PM' },
]

const meta = {
  title: 'Patterns/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    columns,
    data: users,
  },
}

export const Loading: Story = {
  args: {
    columns,
    data: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    columns,
    data: [],
    emptyMessage: 'ユーザーが見つかりません',
  },
}

export const ManyRows: Story = {
  args: {
    columns,
    data: Array.from({ length: 50 }, (_, i) => ({
      id: String(i + 1),
      name: `ユーザー ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? 'エンジニア' : i % 3 === 1 ? 'デザイナー' : 'PM',
    })),
  },
}
```

---

## Badge / Tag（バッジ）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive', 'success', 'warning'],
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default:     Story = { args: { children: 'バッジ' } }
export const Secondary:   Story = { args: { children: 'Secondary',   variant: 'secondary'   } }
export const Outline:     Story = { args: { children: 'Outline',     variant: 'outline'     } }
export const Destructive: Story = { args: { children: 'エラー',      variant: 'destructive' } }
export const Success:     Story = { args: { children: '成功',        variant: 'success'     } }
export const Warning:     Story = { args: { children: '警告',        variant: 'warning'     } }

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="outline">outline</Badge>
      <Badge variant="destructive">destructive</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
    </div>
  ),
}
```

---

## Tabs（タブ）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within } from '@storybook/test'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'Composite/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-[600px]"><Story /></div>],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const tabsContent = (
  <Tabs defaultValue="tab1">
    <TabsList>
      <TabsTrigger value="tab1">概要</TabsTrigger>
      <TabsTrigger value="tab2">設定</TabsTrigger>
      <TabsTrigger value="tab3">履歴</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">概要タブの内容</TabsContent>
    <TabsContent value="tab2">設定タブの内容</TabsContent>
    <TabsContent value="tab3">履歴タブの内容</TabsContent>
  </Tabs>
)

export const Default: Story = { render: () => tabsContent }

export const TabSwitch: Story = {
  render: () => tabsContent,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('初期タブ（概要）の確認', async () => {
      await expect(canvas.getByText('概要タブの内容')).toBeVisible()
    })

    await step('設定タブに切り替え', async () => {
      await userEvent.click(canvas.getByRole('tab', { name: '設定' }))
      await expect(canvas.getByText('設定タブの内容')).toBeVisible()
      await expect(canvas.queryByText('概要タブの内容')).not.toBeVisible()
    })
  },
}
```

---

## Avatar（アバター）

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="invalid-url.png" alt="ユーザー" />
      <AvatarFallback>YT</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {['sm', 'md', 'lg'].map((size) => (
        <Avatar key={size} className={size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-16 w-16' : 'h-10 w-10'}>
          <AvatarFallback>YT</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}
```
