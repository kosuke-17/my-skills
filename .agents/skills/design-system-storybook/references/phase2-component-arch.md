# Phase 2: コンポーネントアーキテクチャ設計 — 詳細手順

コンポーネントの設計方針・命名規則・ディレクトリ構成を確定する。コードを書く前に設計を固める。

---

## Step 2-1: Atomic Design 分類の適用

### 分類基準

```
Atoms（原子）
  └── それ以上分解できない最小単位の UI 部品
  └── 単独で意味をなす
  └── 例: Button, Input, Label, Badge, Avatar, Icon, Spinner, Checkbox

Molecules（分子）
  └── Atoms を組み合わせた複合 UI 部品
  └── 単一の機能的責務を持つ
  └── 例: FormField (Label + Input + ErrorMessage)
           SearchBar (Input + Button)
           SelectField (Label + Select)

Organisms（有機体）
  └── Atoms/Molecules を組み合わせた機能的 UI セクション
  └── ビジネスロジックに近い
  └── 例: Header, DataTable, NavigationSidebar, LoginForm

Templates（テンプレート）
  └── Organisms を配置したページレイアウトの骨格
  └── デザインシステムの対象外にすることが多い
```

### 判断フロー

```
「このコンポーネントは他のコンポーネントを内部に持つか？」
  → Yes: Molecules 以上
  → No: Atoms

「ビジネスドメインの知識を持つか？（ユーザー情報、商品情報など）」
  → Yes: Organisms
  → No: Molecules
```

---

## Step 2-2: コンポーネント API 設計原則

### 原則一覧

**1. Props は最小限にする (YAGNI)**
```tsx
// ❌ 使われない可能性のある props を先取りで追加
interface ButtonProps {
  label: string
  tooltip?: string       // 本当に必要？
  analyticsId?: string   // コンポーネントの責務ではない
  animationDelay?: number // 過剰
}

// ✅ 必要なものだけ
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
```

**2. HTML ネイティブ属性を拡張する (Polymorphism)**
```tsx
// ✅ React.ComponentPropsWithoutRef で HTML 標準属性を受け入れる
interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

// これにより type="submit", form="xxx", aria-label="..." なども受け取れる
```

**3. asChild パターン（Radix UI スタイル）**
```tsx
// ✅ レンダリング要素を変えたい場合は asChild を使う
<Button asChild>
  <a href="/dashboard">ダッシュボードへ</a>
</Button>
// → <a> としてレンダリングされる。<button> は不要
```

**4. Compound Component パターン**
```tsx
// ✅ 関連するコンポーネントを同じ namespace にまとめる
<Select>
  <Select.Trigger>選択してください</Select.Trigger>
  <Select.Content>
    <Select.Item value="1">オプション1</Select.Item>
    <Select.Item value="2">オプション2</Select.Item>
  </Select.Content>
</Select>
```

**5. ref の転送**
```tsx
// ✅ DOM 要素への直接アクセスが必要な場合は forwardRef を使う
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputVariants(), className)} {...props} />
  )
)
Input.displayName = 'Input'
```

---

## Step 2-3: バリアントシステムの設計

### CVA (class-variance-authority) を使ったバリアント定義（推奨）

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // base classes（全バリアントで共通）
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:     'bg-brand-primary text-white hover:bg-brand-hover',
        secondary:   'bg-brand-secondary text-brand-primary hover:bg-brand-secondary/80',
        outline:     'border border-border-default bg-transparent hover:bg-bg-secondary',
        ghost:       'hover:bg-bg-secondary',
        destructive: 'bg-status-error text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8  px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" aria-hidden="true" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
export type { ButtonProps }
```

### tailwind-variants を使う場合

```typescript
import { tv } from 'tailwind-variants'

const button = tv({
  base: 'inline-flex items-center justify-center font-medium transition-colors',
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 hover:bg-gray-50',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
  compoundVariants: [
    // バリアントの組み合わせ固有のスタイル
    { variant: 'outline', size: 'lg', class: 'font-semibold' },
  ],
})
```

---

## Step 2-4: ディレクトリ構成テンプレート

### 推奨構成

```
src/
├── styles/
│   └── tokens/          # Phase 1 で作成したトークン
│       ├── index.css
│       ├── primitive/
│       └── semantic/
│
├── components/
│   ├── ui/              # Atoms（汎用 UI 部品）
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.stories.tsx
│   │   │   └── index.ts         # re-export
│   │   ├── input/
│   │   │   ├── input.tsx
│   │   │   ├── input.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts             # ui 配下の全コンポーネントを re-export
│   │
│   ├── composite/       # Molecules（複合 UI 部品）
│   │   ├── form-field/
│   │   │   ├── form-field.tsx
│   │   │   ├── form-field.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── patterns/        # Organisms（機能的 UI パターン）
│       ├── data-table/
│       │   ├── data-table.tsx
│       │   ├── data-table-column-header.tsx
│       │   ├── data-table.stories.tsx
│       │   └── index.ts
│       └── index.ts
│
└── lib/
    └── utils.ts         # cn() などのユーティリティ
```

### ファイル構成ルール

```
各コンポーネントディレクトリに必要なファイル:
  ├── {name}.tsx          # コンポーネント実装（必須）
  ├── {name}.stories.tsx  # Storybook Story（必須）
  └── index.ts            # re-export（必須）

必要に応じて追加するファイル:
  ├── {name}.test.tsx     # ユニットテスト
  ├── {name}.types.ts     # 型定義（複雑な場合）
  └── use-{name}.ts       # カスタムフック（ロジックが複雑な場合）
```

---

## Step 2-5: index.ts の re-export 設計

```typescript
// components/ui/button/index.ts
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'

// components/ui/index.ts
export * from './button'
export * from './input'
export * from './label'
export * from './badge'
// ...全 atoms の re-export

// components/index.ts（ライブラリとして公開する場合）
export * from './ui'
export * from './composite'
export * from './patterns'
```

---

## Step 2-6: 命名規則の統一

### ルール一覧

```
ディレクトリ名:    kebab-case   (form-field, data-table)
コンポーネントファイル: kebab-case   (form-field.tsx)
コンポーネント名:   PascalCase   (FormField, DataTable)
Props 型名:       PascalCase + Props サフィックス (FormFieldProps)
Hook 名:          camelCase + use プレフィックス (useFormField)
バリアント型名:    PascalCase + Variant サフィックス (ButtonVariant)
Story ファイル:    kebab-case + .stories.tsx (button.stories.tsx)
```

### Props の命名規則

```
状態:      isXxx / hasXxx    (isLoading, isDisabled, hasError)
イベント:   onXxx             (onClick, onChange, onSubmit)
子要素:    children          (children: React.ReactNode)
追加CSS:  className          (className?: string)
スタイル:   style             (style?: React.CSSProperties)
参照:      ref               (forwardRef で自動)
```

---

## Step 2-7: ファイルマップの作成とユーザー確認

### 出力フォーマット

```
## コンポーネントファイルマップ

### Atoms (src/components/ui/)
| コンポーネント | ファイル | バリアント |
|-------------|--------|---------|
| Button | ui/button/ | primary, secondary, outline, ghost, destructive × sm, md, lg |
| Input | ui/input/ | default, error, disabled × sm, md, lg |
| Label | ui/label/ | default, required |
| Badge | ui/badge/ | default, secondary, outline, destructive |
| Avatar | ui/avatar/ | sm, md, lg |
| Spinner | ui/spinner/ | sm, md, lg |
| Skeleton | ui/skeleton/ | text, circular, rectangular |

### Molecules (src/components/composite/)
| コンポーネント | ファイル | 内包するAtoms |
|-------------|--------|------------|
| FormField | composite/form-field/ | Label + Input |
| Select | composite/select/ | Trigger, Content, Item |
| Checkbox | composite/checkbox/ | Checkbox + Label |
| Dialog | composite/dialog/ | Trigger, Content, Header, Footer |
| Toast | composite/toast/ | Icon + テキスト + 閉じるボタン |

### Organisms (src/components/patterns/)
| コンポーネント | ファイル | 依存コンポーネント |
|-------------|--------|--------------|
| DataTable | patterns/data-table/ | Button, Checkbox, Spinner, Pagination |
| Pagination | patterns/pagination/ | Button |
```

### 完了条件

- 全コンポーネントのファイルパスが確定している
- バリアント一覧が明記されている
- ユーザーが承認した

---

## Phase 2 完了チェック

```
✅ Atomic Design の分類が全コンポーネントに適用されている
✅ バリアントシステムの実装方針が決まっている（CVA / tailwind-variants 等）
✅ ディレクトリ構成テンプレートが作成されている
✅ 命名規則が文書化されている
✅ ファイルマップが作成されている
✅ ユーザーがアーキテクチャ設計を承認した
```

すべてOKなら → **Phase 3 へ進む**
