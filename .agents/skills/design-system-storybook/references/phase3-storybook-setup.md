# Phase 3: Storybook セットアップ — 詳細手順

Storybook v8 を前提としたセットアップ手順。

---

## Step 3-1: Storybook のインストール・初期化

### 新規インストール（推奨コマンド）

```bash
# Vite + React プロジェクト
pnpm dlx storybook@latest init

# Next.js プロジェクト
pnpm dlx storybook@latest init
```

`init` コマンドは自動でフレームワークを検出し、適切な設定を生成する。

### 生成されるファイル

```
.storybook/
├── main.ts     # Storybook の設定ファイル
└── preview.ts  # グローバルデコレーター・パラメーター

src/stories/    # サンプルストーリー（後で削除してOK）
```

### 起動確認

```bash
pnpm storybook
# → http://localhost:6006 でアクセス
```

---

## Step 3-2: 推奨アドオンの追加

### インストール

```bash
pnpm add -D \
  @storybook/addon-a11y \
  @storybook/addon-docs \
  @storybook/addon-controls \
  @storybook/addon-viewport \
  @storybook/addon-backgrounds \
  @storybook/test \
  @storybook/addon-interactions
```

### 各アドオンの役割

| アドオン | 用途 |
|--------|------|
| `@storybook/addon-a11y` | アクセシビリティ検査（axe-core を使用） |
| `@storybook/addon-docs` | MDX / autodocs によるドキュメント自動生成 |
| `@storybook/addon-controls` | Props を UI から動的に変更 |
| `@storybook/addon-viewport` | レスポンシブ確認用ビューポート切り替え |
| `@storybook/addon-backgrounds` | 背景色切り替え（ダークモード確認等） |
| `@storybook/test` | play 関数内でのアサーション |
| `@storybook/addon-interactions` | インタラクションテスト結果の可視化 |

---

## Step 3-3: `.storybook/main.ts` の設定

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  // ストーリーのファイルパスパターン
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],

  // 有効にするアドオン
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],

  // フレームワーク設定
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // TypeScript 設定
  typescript: {
    // コンポーネントのコメント (JSDoc) を自動でドキュメントに反映
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        prop.parent
          ? !/node_modules/.test(prop.parent.fileName)
          : true,
    },
  },

  // Docs の設定
  docs: {
    autodocs: 'tag', // meta に tags: ['autodocs'] を持つストーリーで自動生成
  },
}

export default config
```

### Next.js の場合

```typescript
framework: {
  name: '@storybook/nextjs',
  options: {},
},
```

---

## Step 3-4: `.storybook/preview.ts` の設定

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react'
import '../src/styles/tokens/index.css'  // デザイントークンを読み込む
import '../src/styles/globals.css'       // グローバルスタイル

const preview: Preview = {
  parameters: {
    // Controls の設定
    controls: {
      matchers: {
        // 色に関連する props は colorpicker UI を使う
        color: /(background|color)$/i,
        // Date 型は date picker を使う
        date: /date$/i,
      },
      sort: 'requiredFirst',  // 必須 props を上に表示
    },

    // Actions の設定
    actions: {
      argTypesRegex: '^on[A-Z].*',  // on で始まる props を自動で action に
    },

    // Backgrounds（背景色）の設定
    backgrounds: {
      default: 'white',
      values: [
        { name: 'white', value: '#ffffff' },
        { name: 'light gray', value: '#f9fafb' },
        { name: 'dark', value: '#111827' },
      ],
    },

    // Viewport の設定
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
      defaultViewport: 'desktop',
    },

    // Docs の設定
    docs: {
      toc: true,  // 目次を表示
    },

    // a11y の設定
    a11y: {
      config: {
        rules: [
          // プロジェクト固有の例外ルールを設定できる
          // { id: 'color-contrast', enabled: false },
        ],
      },
    },
  },

  // グローバルデコレーター
  decorators: [
    // Tailwind のリセットスタイルが必要な場合
    // (Story) => <div className="font-sans">{Story()}</div>,
  ],
}

export default preview
```

### ThemeProvider が必要な場合のグローバルデコレーター

```typescript
// .storybook/preview.ts に追加
import { ThemeProvider } from '../src/components/theme-provider'

decorators: [
  (Story) => (
    <ThemeProvider defaultTheme="light" storageKey="storybook-theme">
      <Story />
    </ThemeProvider>
  ),
],
```

---

## Step 3-5: デザイントークンの Storybook への反映

### CSS変数を使っている場合

`preview.ts` でグローバルCSS（トークン定義）を import するだけで OK（Step 3-4 参照）。

### Tailwind CSS と組み合わせる場合

```typescript
// .storybook/preview.ts
import '../src/styles/globals.css'  // @tailwind directives を含むファイルを import
```

```javascript
// .storybook/main.ts - PostCSS を使う設定
viteFinal: async (config) => {
  config.css = {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  }
  return config
},
```

### Storybook 用の Theme ツールバーボタン（ダークモード切り替え）

```typescript
// .storybook/preview.ts
globalTypes: {
  theme: {
    description: 'Global theme for components',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'dark', title: 'Dark', icon: 'moon' },
      ],
      dynamicTitle: true,
    },
  },
},

decorators: [
  (Story, context) => {
    const theme = context.globals.theme ?? 'light'
    return (
      <div data-theme={theme}>
        <Story />
      </div>
    )
  },
],
```

---

## Step 3-6: 動作確認チェックリスト

```bash
# 起動確認
pnpm storybook

確認項目:
□ http://localhost:6006 でアクセスできる
□ サイドバーにカテゴリが表示される
□ Controls タブが表示される
□ Actions タブが表示される
□ Accessibility タブが表示される
□ Docs タブが表示される
□ Viewport 切り替えボタンが表示される
□ Backgrounds 切り替えボタンが表示される
□ デザイントークン（フォント・カラー等）が反映されている
□ TypeScript エラーがない
```

---

## トラブルシューティング

### CSS が当たらない

```
原因: preview.ts の import パスが間違っている
解決: 相対パスを確認する（'../src/styles/...'）
```

### TypeScript エラー: Cannot find module '@storybook/...'

```
原因: パッケージが node_modules に存在しない
解決: pnpm install を再実行する
```

### Vite の設定が Storybook に引き継がれない

```
解決: main.ts の viteFinal でマージする

viteFinal: async (config) => {
  // vite.config.ts の設定をマージ
  const { mergeConfig } = await import('vite')
  return mergeConfig(config, {
    resolve: { alias: { '@': '/src' } },
  })
},
```

---

## Phase 3 完了チェック

```
✅ pnpm storybook で起動する
✅ 推奨アドオン（a11y, docs, controls, viewport, backgrounds, interactions）が有効
✅ デザイントークンが Storybook の描画に反映されている
✅ TypeScript エラーがない
✅ Tailwind / CSS が正しく適用されている
```

すべてOKなら → **Phase 4 へ進む**
