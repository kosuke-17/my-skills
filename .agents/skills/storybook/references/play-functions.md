# play 関数・インタラクションテスト

play 関数を使ってユーザー操作をシミュレートし、コンポーネントの動作を検証する。
`@storybook/test` の `userEvent` と `expect` を使用する。

---

## 基本構文

```typescript
import { expect, fn, userEvent, within, waitFor } from '@storybook/test'

export const SomeInteraction: Story = {
  args: {
    onClick: fn(),  // モック関数（呼び出し検証に使う）
  },
  play: async ({ canvasElement, args, step }) => {
    // canvasElement: ストーリーが描画された DOM 要素
    const canvas = within(canvasElement)

    // --- ユーザー操作 ---
    await userEvent.click(canvas.getByRole('button'))
    await userEvent.type(canvas.getByRole('textbox'), 'テキスト')
    await userEvent.clear(canvas.getByRole('textbox'))
    await userEvent.keyboard('{Enter}')
    await userEvent.tab()

    // --- アサーション ---
    await expect(canvas.getByText('完了')).toBeInTheDocument()
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}
```

---

## step() で論理ブロックに分割する

```typescript
export const FormValidation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('空のフォームを送信', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '送信' }))
    })

    await step('バリデーションエラーを確認', async () => {
      await expect(
        canvas.getByText('メールアドレスを入力してください')
      ).toBeInTheDocument()
    })

    await step('正しい値を入力', async () => {
      await userEvent.type(
        canvas.getByLabelText('メールアドレス'),
        'user@example.com'
      )
    })

    await step('エラーが消えることを確認', async () => {
      await expect(
        canvas.queryByText('メールアドレスを入力してください')
      ).not.toBeInTheDocument()
    })
  },
}
```

---

## 要素の取得方法（クエリ）

### 優先順位（アクセシビリティを考慮した順）

```typescript
const canvas = within(canvasElement)

// 1. role + name（最も推奨。アクセシブルな実装の確認にもなる）
canvas.getByRole('button', { name: '送信' })
canvas.getByRole('textbox', { name: 'メールアドレス' })
canvas.getByRole('dialog', { name: '確認' })
canvas.getByRole('checkbox', { name: '同意する' })

// 2. label テキスト（フォーム要素に有効）
canvas.getByLabelText('メールアドレス')
canvas.getByLabelText('パスワード')

// 3. placeholder テキスト
canvas.getByPlaceholderText('user@example.com')

// 4. 表示テキスト
canvas.getByText('エラーが発生しました')

// 5. alt テキスト（画像）
canvas.getByAltText('プロフィール画像')

// 6. test-id（最終手段。他の方法が使えない場合のみ）
canvas.getByTestId('submit-button')
```

### `getBy` vs `queryBy` vs `findBy`

```typescript
// getBy: 要素が存在しないと即エラー（存在することを前提とするとき）
canvas.getByRole('button')

// queryBy: 要素がなければ null を返す（存在しないことを確認するとき）
await expect(canvas.queryByText('エラー')).not.toBeInTheDocument()

// findBy: 非同期で要素を待つ（API コール後の表示確認）
const result = await canvas.findByText('送信完了')
```

---

## userEvent の操作パターン

### クリック

```typescript
// 通常クリック
await userEvent.click(canvas.getByRole('button', { name: 'OK' }))

// ダブルクリック
await userEvent.dblClick(canvas.getByRole('button'))

// 右クリック
await userEvent.pointer({ target: element, keys: '[MouseRight]' })
```

### テキスト入力

```typescript
// 文字列を1文字ずつタイプ（リアルなユーザー入力）
await userEvent.type(canvas.getByRole('textbox'), 'hello world')

// 既存の値を消してから入力
await userEvent.clear(canvas.getByRole('textbox'))
await userEvent.type(canvas.getByRole('textbox'), '新しい値')

// clipboard からペースト（一括入力。type より高速）
await userEvent.paste(canvas.getByRole('textbox'), 'ペーストするテキスト')
```

### キーボード操作

```typescript
// 特殊キー
await userEvent.keyboard('{Enter}')
await userEvent.keyboard('{Escape}')
await userEvent.keyboard('{Tab}')
await userEvent.keyboard('{ArrowDown}')
await userEvent.keyboard('{Backspace}')
await userEvent.keyboard('{Delete}')
await userEvent.keyboard('{Space}')

// 修飾キーとの組み合わせ
await userEvent.keyboard('{Control>}a{/Control}')  // Ctrl+A（全選択）
await userEvent.keyboard('{Shift>}{Tab}{/Shift}')  // Shift+Tab（逆タブ移動）

// Tab でフォーカス移動
await userEvent.tab()
await userEvent.tab({ shift: true })  // 逆方向
```

### セレクト・チェックボックス

```typescript
// select 要素
await userEvent.selectOptions(
  canvas.getByRole('combobox'),
  'option-value'
)

// チェックボックス（click で toggle）
await userEvent.click(canvas.getByRole('checkbox', { name: '同意する' }))

// ラジオボタン
await userEvent.click(canvas.getByRole('radio', { name: 'オプションB' }))
```

### ホバー・フォーカス

```typescript
// ホバー（Tooltip の表示確認等）
await userEvent.hover(canvas.getByRole('button'))
await expect(canvas.getByRole('tooltip')).toBeInTheDocument()

// ホバー解除
await userEvent.unhover(canvas.getByRole('button'))

// フォーカス
await canvas.getByRole('textbox').focus()
// または
await userEvent.click(canvas.getByRole('textbox'))
```

---

## expect のマッチャー一覧

```typescript
// DOM の存在確認
await expect(element).toBeInTheDocument()
await expect(element).not.toBeInTheDocument()

// 表示・非表示
await expect(element).toBeVisible()
await expect(element).not.toBeVisible()

// 無効状態
await expect(element).toBeDisabled()
await expect(element).toBeEnabled()

// テキスト内容
await expect(element).toHaveTextContent('テキスト')
await expect(element).toHaveTextContent(/正規表現/)

// 属性値
await expect(element).toHaveAttribute('aria-expanded', 'true')
await expect(element).toHaveAttribute('type', 'submit')

// クラス名
await expect(element).toHaveClass('active')

// 入力値
await expect(input).toHaveValue('入力されたテキスト')
await expect(checkbox).toBeChecked()

// フォーカス
await expect(element).toHaveFocus()

// モック関数の呼び出し確認
await expect(mockFn).toHaveBeenCalledTimes(1)
await expect(mockFn).toHaveBeenCalledWith('引数1', '引数2')
await expect(mockFn).toHaveBeenLastCalledWith({ key: 'value' })
await expect(mockFn).not.toHaveBeenCalled()
```

---

## 非同期処理の待機パターン

```typescript
import { waitFor } from '@storybook/test'

// API コールや状態更新を待つ
export const AfterApiCall: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await userEvent.click(canvas.getByRole('button', { name: 'データを取得' }))

    // ローディングが消えるまで待つ
    await waitFor(() => {
      expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    // データが表示されるまで待つ（デフォルト 1000ms タイムアウト）
    const result = await canvas.findByText('取得完了')
    await expect(result).toBeInTheDocument()

    // タイムアウトを延長する場合
    await waitFor(
      () => expect(canvas.getByText('遅いコンテンツ')).toBeInTheDocument(),
      { timeout: 3000 }
    )
  },
}
```

---

## Modal / Dialog のテストパターン

```typescript
export const OpenAndClose: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('ダイアログを開く', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '開く' }))
      await expect(canvas.getByRole('dialog')).toBeVisible()
      await expect(
        canvas.getByRole('heading', { name: 'ダイアログタイトル' })
      ).toBeInTheDocument()
    })

    await step('Escape キーで閉じる', async () => {
      await userEvent.keyboard('{Escape}')
      await waitFor(() => {
        expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    await step('再度開いて閉じるボタンで閉じる', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '開く' }))
      await userEvent.click(canvas.getByRole('button', { name: '閉じる' }))
      await waitFor(() => {
        expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  },
}
```

---

## フォーム送信のテストパターン

```typescript
export const SuccessfulSubmit: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ canvasElement, args, step }) => {
    const canvas = within(canvasElement)

    await step('フォームに入力', async () => {
      await userEvent.type(canvas.getByLabelText('名前'), '山田 太郎')
      await userEvent.type(
        canvas.getByLabelText('メールアドレス'),
        'yamada@example.com'
      )
      await userEvent.selectOptions(
        canvas.getByRole('combobox', { name: '役職' }),
        'engineer'
      )
      await userEvent.click(canvas.getByRole('checkbox', { name: '利用規約に同意する' }))
    })

    await step('送信', async () => {
      await userEvent.click(canvas.getByRole('button', { name: '送信' }))
      await expect(args.onSubmit).toHaveBeenCalledOnce()
      await expect(args.onSubmit).toHaveBeenCalledWith({
        name: '山田 太郎',
        email: 'yamada@example.com',
        role: 'engineer',
        agreed: true,
      })
    })
  },
}
```

---

## Dropdown / Combobox のテストパターン

```typescript
export const SelectOption: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    await step('ドロップダウンを開く', async () => {
      await userEvent.click(trigger)
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    await step('オプションを選択する', async () => {
      await userEvent.click(canvas.getByRole('option', { name: 'オプション2' }))
      // 選択後にドロップダウンが閉じることを確認
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(trigger).toHaveTextContent('オプション2')
    })
  },
}
```
