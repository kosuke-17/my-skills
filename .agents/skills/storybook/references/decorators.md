# Decorator パターン集

Decorator はコンポーネントをラップして、レンダリングに必要なコンテキストを提供する。

---

## Decorator の適用範囲

```typescript
// 1. グローバル（全ストーリーに適用） → .storybook/preview.ts
export const decorators = [
  (Story) => <ThemeProvider><Story /></ThemeProvider>,
]

// 2. ファイル単位（meta に設定） → *.stories.tsx の meta
const meta = {
  decorators: [
    (Story) => <div className="p-8"><Story /></div>,
  ],
} satisfies Meta<typeof Component>

// 3. ストーリー単位（特定のストーリーだけ）
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" className="bg-gray-900 p-8">
        <Story />
      </div>
    ),
  ],
}
```

---

## Theme Provider

```typescript
// ThemeProvider（カスタムテーマ）
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <ThemeProvider defaultTheme="dark">
        <Story />
      </ThemeProvider>
    ),
  ],
}

// CSS 変数でのダークモード切り替え
export const DarkMode: Story = {
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
```

---

## React Router（Next.js 以外）

```typescript
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Link や useNavigate を使うコンポーネント
export const WithRouter: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
}
```

---

## Next.js App Router

```typescript
// next/navigation の useRouter, usePathname, useSearchParams
// → @storybook/nextjs が自動でモックを提供する

// useRouter の挙動をカスタマイズする場合
import { action } from '@storybook/addon-actions'

export const WithNavigation: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dashboard',
        query: { tab: 'overview' },
      },
    },
  },
}
```

---

## React Query / SWR（データフェッチ）

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ストーリーごとに QueryClient を新規作成する
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,         // テスト時はリトライ不要
        staleTime: Infinity,  // キャッシュが無効化されないようにする
      },
    },
  })

export const WithData: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={createQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
}
```

### MSW（Mock Service Worker）でAPIをモックする

```typescript
// .storybook/preview.ts に MSW の初期化
import { initialize, mswLoader } from 'msw-storybook-addon'
initialize()

export const loaders = [mswLoader]

// ストーリーでのモックハンドラー設定
import { http, HttpResponse } from 'msw'

export const LoadedState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () =>
          HttpResponse.json([
            { id: 1, name: '山田 太郎' },
            { id: 2, name: '鈴木 花子' },
          ])
        ),
      ],
    },
  },
}

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () =>
          HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
        ),
      ],
    },
  },
}

export const LoadingState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', async () => {
          await new Promise((resolve) => setTimeout(resolve, 999999))
          return HttpResponse.json([])
        }),
      ],
    },
  },
}
```

---

## i18n（国際化）

```typescript
import i18n from '../src/i18n'
import { I18nextProvider } from 'react-i18next'

export const Japanese: Story = {
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
  parameters: {
    locale: 'ja',
  },
}

export const English: Story = {
  decorators: [
    (Story) => (
      <I18nextProvider i18n={i18n}>
        <Story />
      </I18nextProvider>
    ),
  ],
  parameters: {
    locale: 'en',
  },
}
```

---

## Zustand / Context API（状態管理）

```typescript
// Zustand ストアの初期状態をリセットする
import { useEffect } from 'react'
import { useUserStore } from '../src/stores/user-store'

const StoreResetter = ({
  initialState,
  children,
}: {
  initialState: Partial<UserStore>
  children: React.ReactNode
}) => {
  useEffect(() => {
    useUserStore.setState(initialState)
    return () => useUserStore.setState({})  // クリーンアップ
  }, [initialState])
  return <>{children}</>
}

export const LoggedIn: Story = {
  decorators: [
    (Story) => (
      <StoreResetter initialState={{ user: { id: '1', name: '山田 太郎' } }}>
        <Story />
      </StoreResetter>
    ),
  ],
}

export const NotLoggedIn: Story = {
  decorators: [
    (Story) => (
      <StoreResetter initialState={{ user: null }}>
        <Story />
      </StoreResetter>
    ),
  ],
}
```

---

## ラッパー・コンテナー装飾

```typescript
// 固定幅のコンテナ内で表示（レスポンシブ確認用）
export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '375px', border: '1px dashed #ccc' }}>
        <Story />
      </div>
    ),
  ],
}

// フォームのラッパー（フォーム要素は form 内に置く必要がある）
export const InsideForm: Story = {
  decorators: [
    (Story) => (
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <Story />
      </form>
    ),
  ],
}

// padding で余白を追加
export const WithPadding: Story = {
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',  // padding を decorator で制御するとき
  },
}
```

---

## context を使ったグローバルツールバー連携

`.storybook/preview.ts` でテーマ切り替えボタンを追加し、Decorator でそれを受け取る。

```typescript
// preview.ts
export const globalTypes = {
  theme: {
    description: 'Theme',
    toolbar: {
      title: 'Theme',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light', icon: 'sun' },
        { value: 'dark',  title: 'Dark',  icon: 'moon' },
      ],
      dynamicTitle: true,
    },
  },
}

export const decorators = [
  (Story, context) => {
    const theme = context.globals.theme ?? 'light'
    return (
      <div
        data-theme={theme}
        style={{
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    )
  },
]
```
