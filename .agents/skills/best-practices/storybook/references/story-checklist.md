# Story品質チェックリスト

Storyファイルの生成・レビュー時に使用するチェックリスト。

---

## Meta設定チェックリスト

```
□ `satisfies Meta<typeof Component>` を使用している
□ `title` が適切な階層パスになっている（例: 'UI/Button'）
□ `component` が設定されている（Props自動ドキュメント生成に必要）
□ `tags: ['autodocs']` が設定されている
□ `parameters.layout` が適切に設定されている
    □ centered  — コンパクトなUIコンポーネント（推奨デフォルト）
    □ fullscreen — ページ・ナビゲーション・全幅コンポーネント
    □ padded    — コンテナ幅が重要なコンポーネント（Card等）
□ `export default meta` がある
□ `type Story = StoryObj<typeof meta>` が定義されている
```

---

## ストーリーカバレッジチェックリスト

### 全コンポーネント共通（必須）

```
□ Default ストーリーがある（最も基本的な使い方）
□ Disabled ストーリーがある（disabled Propsがある場合）
□ AllVariants ストーリーがある（variant Propsがある場合）
```

### バリアント系（variant Propsがある場合）

```
□ 各 variant に対応する個別ストーリーがある
□ AllVariants（全バリアント比較）ストーリーがある
□ サイズバリアント（sm/md/lg等）がある場合はサイズ別ストーリーもある
```

### 状態系

```
□ Loading ストーリーがある（loading Propsがある場合）
□ WithError / ErrorState ストーリーがある（エラー状態を持つ場合）
□ Checked / Selected ストーリーがある（チェック/選択状態がある場合）
□ LongContent ストーリーがある（テキストが可変で折り返し挙動が重要な場合）
□ WithIcon ストーリーがある（アイコン付きの使い方がある場合）
```

---

## ArgTypesチェックリスト

```
□ variant Props に control: 'select' と options が設定されている
□ boolean Props に control: 'boolean' が設定されている
□ string Props に control: 'text' が設定されている
□ number Props に control: { type: 'number' } が設定されている
□ 各 ArgType に description が設定されている
□ 主要な Props に table.type.summary が設定されている（型名を表示）
□ 主要な Props に table.defaultValue.summary が設定されている
□ className / style / ref は table: { disable: true } で非表示にしている
□ コールバック Props（onClick等）は action: 'xxx' が設定されている
```

---

## アクセシビリティチェックリスト

```
□ アイコンのみのインタラクティブ要素に aria-label が設定されている
□ フォーム要素に対応する label が関連付けられている
□ @storybook/addon-a11y でエラーが出ないことを確認している
□ キーボード操作が必要なコンポーネントにインタラクションテストがある
```

---

## ファイル構成チェックリスト

```
□ ファイル名: {component-name}.stories.tsx（kebab-case）
□ import パスが正しい（barrel export 経由が望ましい）
□ `import type { Meta, StoryObj } from '@storybook/react'` がある
□ Play関数を使う場合 `import { expect, userEvent, within } from '@storybook/test'` がある
□ render 関数内でのみ JSX を使っている（args 系は render 不要）
□ Storybook上でエラーなく表示される
```

---

## 優先度ガイド

レビュー時のフィードバック優先度の目安:

| 問題 | 優先度 |
|------|--------|
| `satisfies Meta<>` を使っていない | 🟡 Suggestion |
| `tags: ['autodocs']` がない | 🟡 Suggestion |
| Default ストーリーがない | 🟡 Suggestion |
| 全バリアントのストーリーが揃っていない | 🟡 Suggestion |
| ArgTypes に description がない | 🟢 Nice to have |
| AllVariants ストーリーがない | 🟢 Nice to have |
| Play関数がない（インタラクティブなコンポーネント） | 🟢 Nice to have |
| a11y違反がある | 🔴 Critical |
| TypeScriptエラーがある | 🔴 Critical |
| Storybookでエラー表示になる | 🔴 Critical |
