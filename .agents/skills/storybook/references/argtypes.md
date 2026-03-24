# ArgTypes / Controls の全設定パターン

ArgTypes は Controls パネルの UI・型情報・ドキュメントをカスタマイズする。

---

## control の種類と使い分け

```typescript
argTypes: {
  // --- テキスト ---
  label: {
    control: 'text',
    description: 'ラベルのテキスト',
  },

  // --- 数値 ---
  count: {
    control: { type: 'number', min: 0, max: 100, step: 1 },
    description: 'カウント数',
  },

  // --- 真偽値 ---
  disabled: {
    control: 'boolean',
    description: '無効状態',
  },

  // --- セレクト（文字列リテラルの union 型に使う） ---
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
    description: 'ボタンの外観バリアント',
  },

  // --- ラジオ（選択肢が少ない場合。2〜4個が目安） ---
  size: {
    control: 'radio',
    options: ['sm', 'md', 'lg'],
    description: 'サイズ',
  },

  // --- インラインラジオ（横並び表示） ---
  align: {
    control: 'inline-radio',
    options: ['left', 'center', 'right'],
  },

  // --- チェックボックス（複数選択） ---
  features: {
    control: 'check',
    options: ['bold', 'italic', 'underline'],
  },

  // --- 色 ---
  backgroundColor: {
    control: 'color',
    description: '背景色（HEX / RGB / HSL）',
  },

  // --- 日付 ---
  createdAt: {
    control: 'date',
    description: '作成日',
  },

  // --- オブジェクト（JSONエディタが表示される） ---
  config: {
    control: 'object',
    description: '設定オブジェクト',
  },

  // --- ファイル ---
  avatarFile: {
    control: 'file',
    accept: '.png,.jpg,.jpeg',
  },

  // --- Range スライダー ---
  opacity: {
    control: { type: 'range', min: 0, max: 1, step: 0.1 },
  },
}
```

---

## table でドキュメントをカスタマイズ

```typescript
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
    description: 'ボタンの外観スタイル',
    table: {
      // 型の表示テキスト
      type: { summary: "'primary' | 'secondary' | 'outline'" },
      // デフォルト値の表示
      defaultValue: { summary: 'primary' },
      // カテゴリでグルーピング（Controls パネルに見出しが出る）
      category: 'Appearance',
    },
  },

  // ---- 非表示にする props ----
  // HTML の標準属性（className, style, ref 等）は非表示が推奨
  className: { table: { disable: true } },
  style:     { table: { disable: true } },
  ref:       { table: { disable: true } },
  id:        { table: { disable: true } },
}
```

---

## アクション（イベントハンドラ）の設定

```typescript
// 方法1: argTypes で明示的に設定
argTypes: {
  onClick:   { action: 'clicked' },
  onChange:  { action: 'changed' },
  onSubmit:  { action: 'submitted' },
  onClose:   { action: 'closed' },
}

// 方法2: preview.ts の正規表現でまとめて設定（グローバル）
// parameters: { actions: { argTypesRegex: '^on[A-Z].*' } }

// 方法3: play 関数内で fn() を使う（インタラクションテストと組み合わせる場合）
import { fn } from '@storybook/test'
export const ClickTest: Story = {
  args: {
    onClick: fn(),  // モック関数。呼び出しが Interactions パネルに記録される
  },
}
```

---

## 実際の使用例: Button コンポーネント

```typescript
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    // バリアント
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      description: 'ボタンの外観スタイル',
      table: {
        type: { summary: 'ButtonVariant' },
        defaultValue: { summary: 'primary' },
        category: 'Appearance',
      },
    },
    // サイズ
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: 'md' },
        category: 'Appearance',
      },
    },
    // 状態
    loading: {
      control: 'boolean',
      description: 'ローディング中。Spinner を表示し disabled になる',
      table: { category: 'State' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    // コンテンツ
    children: {
      control: 'text',
      description: 'ボタンのラベル',
      table: { category: 'Content' },
    },
    // イベント
    onClick: {
      action: 'clicked',
      table: { category: 'Events' },
    },
    // 非表示
    className: { table: { disable: true } },
    asChild:   { table: { disable: true } },
  },
} satisfies Meta<typeof Button>
```

---

## 実際の使用例: Input コンポーネント

```typescript
const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'input の type 属性',
      table: { defaultValue: { summary: 'text' } },
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    // エラー状態（独自 prop の場合）
    error: {
      control: 'boolean',
      description: 'エラー状態。赤いボーダーを表示する',
    },
    // HTML 標準属性は非表示
    className:    { table: { disable: true } },
    ref:          { table: { disable: true } },
    defaultValue: { table: { disable: true } },
  },
} satisfies Meta<typeof Input>
```

---

## よくあるミス

```typescript
// ❌ options がない select は機能しない
argTypes: {
  variant: { control: 'select' }  // options が必須
}

// ✅
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary'],
  },
}

// ❌ boolean を text control にしてしまう
argTypes: {
  disabled: { control: 'text' }  // チェックボックスにならない
}

// ✅
argTypes: {
  disabled: { control: 'boolean' }
}

// ❌ ReactNode 型を control に設定する（表示が崩れる）
argTypes: {
  children: { control: 'object' }  // JSX は JSON エディタで扱えない
}

// ✅ children は text か制御不要にする
argTypes: {
  children: { control: 'text' },  // シンプルな文字列のみ許容する場合
}
```
