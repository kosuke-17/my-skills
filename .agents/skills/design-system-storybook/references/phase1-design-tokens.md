# Phase 1: デザイントークン設計 — 詳細手順

デザインシステムの「語彙」となるトークンを二層構造で定義する。

---

## トークンの二層構造（必須知識）

```
プリミティブトークン (Primitive Tokens)
  └── 値そのもの。色の HEX コード、px 値など
  └── 例: --color-blue-500: #3B82F6

セマンティックトークン (Semantic Tokens)
  └── 用途や意味を表す。プリミティブを参照する
  └── 例: --color-brand-primary: var(--color-blue-500)
           --color-interactive-default: var(--color-blue-500)
```

**ルール**: コンポーネントはセマンティックトークンのみを参照する。プリミティブトークンは直接使わない。

---

## Step 1-1: カラートークンの設計

### プリミティブカラーパレット

```css
/* tokens/primitive/colors.css */
:root {
  /* Gray Scale */
  --color-gray-50:  #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;

  /* Brand */
  --color-brand-50:  #EFF6FF;
  --color-brand-100: #DBEAFE;
  --color-brand-200: #BFDBFE;
  --color-brand-300: #93C5FD;
  --color-brand-400: #60A5FA;
  --color-brand-500: #3B82F6;
  --color-brand-600: #2563EB;
  --color-brand-700: #1D4ED8;
  --color-brand-800: #1E40AF;
  --color-brand-900: #1E3A8A;

  /* Semantic Status */
  --color-red-500:   #EF4444;
  --color-yellow-500: #EAB308;
  --color-green-500: #22C55E;
}
```

### セマンティックカラートークン（ライトモード）

```css
/* tokens/semantic/colors.css */
:root {
  /* Brand */
  --color-brand-primary:   var(--color-brand-600);
  --color-brand-secondary: var(--color-brand-100);
  --color-brand-hover:     var(--color-brand-700);
  --color-brand-active:    var(--color-brand-800);

  /* Text */
  --color-text-primary:   var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-disabled:  var(--color-gray-400);
  --color-text-inverse:   #FFFFFF;
  --color-text-link:      var(--color-brand-600);

  /* Background */
  --color-bg-primary:   #FFFFFF;
  --color-bg-secondary: var(--color-gray-50);
  --color-bg-tertiary:  var(--color-gray-100);
  --color-bg-inverse:   var(--color-gray-900);
  --color-bg-overlay:   rgba(0, 0, 0, 0.5);

  /* Border */
  --color-border-default: var(--color-gray-200);
  --color-border-strong:  var(--color-gray-400);
  --color-border-focus:   var(--color-brand-500);

  /* Status */
  --color-status-error:   var(--color-red-500);
  --color-status-warning: var(--color-yellow-500);
  --color-status-success: var(--color-green-500);

  /* Interactive */
  --color-interactive-default:  var(--color-brand-600);
  --color-interactive-hover:    var(--color-brand-700);
  --color-interactive-active:   var(--color-brand-800);
  --color-interactive-disabled: var(--color-gray-300);
}
```

### ダークモード対応（セマンティックトークンを上書き）

```css
[data-theme="dark"] {
  --color-text-primary:   var(--color-gray-50);
  --color-text-secondary: var(--color-gray-400);
  --color-bg-primary:     var(--color-gray-950);
  --color-bg-secondary:   var(--color-gray-900);
  --color-bg-tertiary:    var(--color-gray-800);
  --color-border-default: var(--color-gray-700);
}
```

### ❌ 悪い例・✅ 良い例

```tsx
// ❌ プリミティブを直接コンポーネントに使う
<button className="bg-blue-600 hover:bg-blue-700">

// ✅ セマンティックトークンを参照する
<button style={{ backgroundColor: 'var(--color-interactive-default)' }}>

// Tailwind の場合: tailwind.config.ts でセマンティックトークンを定義
// colors: { brand: { primary: 'var(--color-brand-primary)' } }
<button className="bg-brand-primary hover:bg-brand-hover">
```

### 完了条件

- プリミティブカラーが全て定義されている
- セマンティックカラーが全カテゴリ（Brand/Text/Background/Border/Status/Interactive）定義されている

---

## Step 1-2: タイポグラフィトークンの設計

```css
/* tokens/primitive/typography.css */
:root {
  /* Font Family */
  --font-family-sans:  'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono:  'JetBrains Mono', 'Fira Code', monospace;

  /* Font Size Scale (Major Third: 1.25倍) */
  --font-size-xs:   0.75rem;   /* 12px */
  --font-size-sm:   0.875rem;  /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg:   1.125rem;  /* 18px */
  --font-size-xl:   1.25rem;   /* 20px */
  --font-size-2xl:  1.5rem;    /* 24px */
  --font-size-3xl:  1.875rem;  /* 30px */
  --font-size-4xl:  2.25rem;   /* 36px */

  /* Font Weight */
  --font-weight-regular:  400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* Line Height */
  --line-height-tight:  1.25;
  --line-height-snug:   1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;

  /* Letter Spacing */
  --letter-spacing-tight:  -0.025em;
  --letter-spacing-normal: 0em;
  --letter-spacing-wide:   0.025em;
  --letter-spacing-wider:  0.05em;
}
```

### テキストスタイルの複合トークン（TypeScript）

```typescript
// tokens/typography.ts
export const textStyles = {
  'heading-xl': {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: 'var(--font-weight-bold)',
    lineHeight: 'var(--line-height-tight)',
    letterSpacing: 'var(--letter-spacing-tight)',
  },
  'heading-lg': {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: 'var(--font-weight-bold)',
    lineHeight: 'var(--line-height-tight)',
  },
  'heading-md': {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 'var(--line-height-snug)',
  },
  'body-lg': {
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 'var(--line-height-relaxed)',
  },
  'body-md': {
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 'var(--line-height-normal)',
  },
  'body-sm': {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 'var(--line-height-normal)',
  },
  'label-md': {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    lineHeight: 'var(--line-height-normal)',
  },
  'caption': {
    fontSize: 'var(--font-size-xs)',
    fontWeight: 'var(--font-weight-regular)',
    lineHeight: 'var(--line-height-normal)',
  },
} as const
```

---

## Step 1-3: スペーシングスケールの設計

**ルール**: 4px ベース（0.25rem 刻み）。8の倍数を主に使用する。

```css
/* tokens/primitive/spacing.css */
:root {
  --spacing-0:   0;
  --spacing-1:   0.25rem;  /* 4px */
  --spacing-2:   0.5rem;   /* 8px */
  --spacing-3:   0.75rem;  /* 12px */
  --spacing-4:   1rem;     /* 16px */
  --spacing-5:   1.25rem;  /* 20px */
  --spacing-6:   1.5rem;   /* 24px */
  --spacing-8:   2rem;     /* 32px */
  --spacing-10:  2.5rem;   /* 40px */
  --spacing-12:  3rem;     /* 48px */
  --spacing-16:  4rem;     /* 64px */
  --spacing-20:  5rem;     /* 80px */
  --spacing-24:  6rem;     /* 96px */
}
```

---

## Step 1-4: シャドウ・エレベーション・ボーダーRadiusの定義

```css
:root {
  /* Shadow / Elevation */
  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);

  /* Border Radius */
  --radius-none: 0;
  --radius-sm:   0.125rem;  /* 2px */
  --radius-md:   0.375rem;  /* 6px */
  --radius-lg:   0.5rem;    /* 8px */
  --radius-xl:   0.75rem;   /* 12px */
  --radius-2xl:  1rem;      /* 16px */
  --radius-full: 9999px;
}
```

---

## Step 1-5: ブレークポイント・モーショントークンの定義

```css
:root {
  /* Breakpoints (JS定数として定義する方がType安全) */
  /* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */

  /* Motion / Animation */
  --duration-instant: 0ms;
  --duration-fast:    150ms;
  --duration-normal:  200ms;
  --duration-slow:    300ms;
  --duration-slower:  500ms;

  --easing-linear:    linear;
  --easing-in:        cubic-bezier(0.4, 0, 1, 1);
  --easing-out:       cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out:    cubic-bezier(0.4, 0, 0.2, 1);
  --easing-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## Step 1-6: 実装形式の決定

### CSS変数のみ（シンプル）

```
メリット: ダークモード対応が容易、ランタイムでの変更が可能
デメリット: TypeScript の型補完がない
適用: Tailwind CSS と組み合わせる場合
```

### TypeScript 定数のみ

```
メリット: 型安全、IDE の補完が効く
デメリット: ダークモードの実装がやや複雑
適用: CSS-in-JS (styled-components / emotion) を使う場合
```

### CSS変数 + TypeScript 定数（推奨）

```
メリット: 両方の利点を得られる
デメリット: 二重管理になりうる（Style Dictionary 等で自動生成を検討）
適用: 規模の大きいデザインシステム
```

---

## Step 1-7: ダークモード対応の確認

```
対応不要 → CSS変数をライトモードのみ定義して完了

data-theme 属性方式（推奨）
  → [data-theme="dark"] セレクタでセマンティックトークンを上書き
  → HTML 要素の data-theme 属性を切り替えるだけで対応

prefers-color-scheme（OS設定連動）
  → @media (prefers-color-scheme: dark) でオーバーライド
  → OS設定に自動追従したい場合に使用

両方対応（手動切り替え + OS設定連動）
  → data-theme が指定されている場合はそちらを優先
  → 指定がない場合は prefers-color-scheme を参照
```

---

## Step 1-8: トークン定義ファイルの作成

### 推奨ディレクトリ構成

```
src/
└── styles/
    └── tokens/
        ├── index.css          # 全トークンのまとめ import
        ├── primitive/
        │   ├── colors.css
        │   ├── typography.css
        │   ├── spacing.css
        │   └── effects.css    # shadow, radius, motion
        └── semantic/
            ├── colors.css
            └── typography.css  # テキストスタイル複合トークン
```

### TypeScript 型定義も必要な場合

```typescript
// tokens/index.ts
export * from './colors'
export * from './spacing'
export * from './typography'

// 型補完のためのリテラル型
export type ColorToken = keyof typeof colorTokens
export type SpacingToken = keyof typeof spacingTokens
```

---

## Phase 1 完了チェック

```
✅ カラートークン（プリミティブ + セマンティック）が定義されている
✅ タイポグラフィトークンが定義されている
✅ スペーシングスケールが定義されている
✅ シャドウ・ボーダーRadiusが定義されている
✅ 実装形式（CSS変数/TS/両方）が決定されている
✅ ダークモード対応方針が決まっている
✅ トークン定義ファイルが作成されコンパイルエラーがない
✅ ユーザーがトークン設計を承認した
```

すべてOKなら → **Phase 2 へ進む**
