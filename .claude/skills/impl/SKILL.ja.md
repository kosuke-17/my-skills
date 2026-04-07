---
name: impl
description: CDDプランに基づいてコンポーネントをボトムアップで実装する。/planで生成されたプランファイルに従い、Atom -> Molecule -> Organism -> Pageの順で静的UI、Storybookストーリー、Jestテストを作成し、必要に応じて動的UIとカスタムフックを追加する。プランファイルのパスを引数として渡す。省略時は最新のプランファイルを使用。
argument-hint: [プランファイルのパス]
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "TodoWrite", "Task", "mcp__storybook-mcp__get-storybook-story-instructions", "mcp__storybook-mcp__get-documentation", "mcp__storybook-mcp__preview-stories", "mcp__storybook-mcp__run-story-tests"]
---

# CDD実装

プランファイルに基づいてコンポーネントをボトムアップで実装する。

## プランファイルの読み込み

- 引数あり: `$ARGUMENTS` からパスを読み取る
- 引数なし: 最新のプランファイルを使用

最新のプランファイル: !`ls -t .claude/plans/*.plan.md 2>/dev/null | head -1 || echo ".claude/plans/にプランファイルが見つかりません。先に /plan を実行してください。"`

プランファイルが見つからない場合は、先に `/plan` を実行するようユーザーに案内する。

プランファイルを読み込んだ後、「実装順序」セクションの各コンポーネントをTodoWriteに登録する。

---

## コンポーネントごとの実装サイクル

プランの実装順序に従い、各コンポーネントを以下のフェーズで実装する。

### フェーズ1: 静的UI (index.tsx)

propsのみでビジュアルを100%完成させる。**stateは使用しない。**

```tsx
import { cn } from '@/utils/cn'

type ComponentNameProps = {
  label: string
  variant?: 'primary' | 'secondary'
  className?: string
}

export default function ComponentName({
  label,
  variant = 'primary',
  className,
}: ComponentNameProps) {
  return (
    <div className={cn('base-styles', className)}>
      {label}
    </div>
  )
}
```

**チェック:**

- `useState` を使用していないこと
- propsのみでUIが完成していること
- `cn()` でクラスを合成していること
- 必要に応じてCVAバリアントが設定されていること

### フェーズ2: ストーリー作成 (index.stories.tsx)

**ストーリーを書く前に**、`mcp__storybook-mcp__get-storybook-story-instructions` を呼び出して、プロジェクトの最新のStorybookの規約を取得する。

コンポーネントが既存コンポーネントを再利用している場合は、`mcp__storybook-mcp__get-documentation` を呼び出して、propsとストーリーパターンを確認する。

CSF 3形式でストーリーを作成する。

```tsx
import type { Meta, StoryObj } from '@storybook/react'

import ComponentName from './index'

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ComponentName>

export const Default: Story = {
  args: {
    label: 'Label',
  },
}
```

**ストーリーを書いた後**、動作を確認する:

1. `mcp__storybook-mcp__preview-stories` を呼び出してプレビューURLを取得し、レンダリングを確認
2. `mcp__storybook-mcp__run-story-tests` を特定のストーリーに対して呼び出し、テスト（a11y含む）を実行

**チェック:**

- `tags: ['autodocs']` が含まれていること
- 計画された全バリエーションのストーリーがあること
- 固定値を使用していること（ランダム値は不可）
- ストーリーが正しくレンダリングされること（プレビューで確認済み）
- ストーリーテストが通ること（run-story-testsで確認済み）

### フェーズ3: ユニットテスト (index.test.tsx)

Arrange-Act-Assert構造でテストを作成する。

```tsx
import { render, screen } from '@testing-library/react'

import ComponentName from './index'

describe('ComponentName', () => {
  it('renders correctly', () => {
    // Arrange
    const props = { label: 'Test' }

    // Act
    render(<ComponentName {...props} />)

    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### フェーズ4: 動的UIの追加（必要な場合のみ）

プランに動的UIが含まれる場合のみ実行する。

1. **カスタムフックを作成** (hooks.ts): stateとロジックを分離

```tsx
// hooks.ts
export function useComponentLogic() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), [])
  return { isOpen, toggleOpen }
}
```

2. **コンポーネントを更新**: フックを使ってstateを追加
3. **play関数テストを追加**: ストーリーにインタラクションテストを追加

```tsx
import { expect, userEvent, within } from '@storybook/test'

export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    await expect(canvas.getByText('Result')).toBeInTheDocument()
  },
}
```

---

## ファイル構成規約

```
components/{component-name}/
├── index.tsx           # メインコンポーネント
├── index.stories.tsx   # Storybookストーリー（CSF 3, tags: ['autodocs']）
├── index.test.tsx      # Jestユニットテスト
└── hooks.ts            # カスタムフック（必要な場合のみ）
```

`features/{feature-name}/components/{component-name}/` も同じ構成。

## コーディング規約

| 項目 | 規約 |
| -------------- | ----------------------------------------------- |
| ファイル名 | kebab-caseディレクトリ、`index.tsx` エントリ |
| インポート | `@/` エイリアスを優先 |
| スタイリング | Tailwind CSS + `cn()` |
| バリアント | CVA (`class-variance-authority`) |
| エクスポート | `export default` |
| booleanプロパティ | `is`/`has`/`can` プレフィックス |
| セミコロン | なし |
| クォート | シングルクォート |
| 末尾カンマ | ES5 |

---

## 実装完了チェック

各コンポーネント完了時に確認:

- [ ] propsのみで静的UIが完成している
- [ ] Storybookストーリーが全バリエーションをカバーしている
- [ ] ユニットテストが作成されている
- [ ] ロジックがカスタムフックに分離されている（必要な場合）
- [ ] インタラクションがplay関数でテストされている（必要な場合）

## 次のステップ

実装が完了したら、品質評価のため `/eval` コマンドを実行する。
