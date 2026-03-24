# Phase 5: テスト・ドキュメント・公開 — 詳細手順

品質保証・ドキュメント整備・公開フローを整える。

---

## Step 5-1: アクセシビリティテストの実行

### addon-a11y の使い方

Phase 3 でセットアップ済みの `@storybook/addon-a11y` を使う。

**各ストーリーの「Accessibility」タブを確認する**:

```
Violations: 修正が必要な問題
Incomplete: 手動確認が必要な問題
Passes:     パスした項目
```

### よくある a11y 違反と修正方法

```
❌ color-contrast: テキストと背景のコントラスト比が不足
   → WCAG AA: 通常テキスト 4.5:1 以上、大きいテキスト 3:1 以上
   → セマンティックカラートークンを調整する

❌ button-name: ボタンにアクセシブルな名前がない
   → aria-label="閉じる" を追加する
   → アイコンのみのボタンに必須

❌ label: フォーム要素に対応する label がない
   → <label htmlFor="input-id"> または aria-label を追加する

❌ heading-order: 見出しの階層が正しくない
   → h1 → h2 → h3 の順序を守る
   → 見出しレベルを飛ばさない

❌ image-alt: img 要素に alt がない
   → 装飾画像: alt=""
   → 意味のある画像: alt="説明文"
```

### ストーリーレベルでの a11y 設定

```typescript
// 特定のルールを無効化（正当な理由がある場合のみ）
export const IconButton: Story = {
  args: { 'aria-label': '閉じる' },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: false,  // このストーリーでは無効化
          },
        ],
      },
    },
  },
}
```

### キーボード操作の手動確認

```
Tab で各インタラクティブ要素にフォーカスが当たるか
Enter / Space でボタン・チェックボックスが動作するか
Escape でモーダル・ドロップダウンが閉じるか
Arrow キーでラジオボタン・タブが移動できるか
```

---

## Step 5-2: インタラクションテストの実行

### テスト実行方法

```bash
# Storybook が起動している状態でインタラクションテストを実行
pnpm test-storybook

# 特定のストーリーのみ実行
pnpm test-storybook --stories "UI/Button"

# CI 環境では --ci フラグを付ける
pnpm test-storybook --ci
```

### package.json への追加

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "test-storybook"
  }
}
```

### play 関数のベストプラクティス

```typescript
import { expect, userEvent, within, waitFor } from '@storybook/test'

export const FormValidation: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    // step() で論理的なブロックに分割（Interactions パネルに表示される）
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
      await waitFor(() => {
        expect(
          canvas.queryByText('メールアドレスを入力してください')
        ).not.toBeInTheDocument()
      })
    })
  },
}
```

---

## Step 5-3: ビジュアルリグレッションテスト（Chromatic）

### セットアップ

```bash
# Chromatic のインストール
pnpm add -D chromatic

# 初回実行（プロジェクトトークンは Chromatic のダッシュボードで取得）
pnpm dlx chromatic --project-token=<YOUR_TOKEN>
```

### package.json への追加

```json
{
  "scripts": {
    "chromatic": "chromatic --project-token=$CHROMATIC_PROJECT_TOKEN"
  }
}
```

### GitHub Actions での自動実行

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 差分検出のため全履歴を取得
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - name: Publish to Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          exitZeroOnChanges: true  # PR の視覚的変更はブロックしない（レビュー必須）
```

### スナップショット対象外のストーリーを除外する

```typescript
// 動的コンテンツ（日時・ランダム等）は差分が出やすいため除外
export const RealtimeClock: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
}

// アニメーション中の状態はスナップショットを遅延させる
export const AnimatedEntry: Story = {
  parameters: {
    chromatic: { delay: 300 },  // 300ms 待ってからスナップショット
  },
}
```

---

## Step 5-4: MDX によるコンポーネントドキュメント

### autodocs による自動生成

`tags: ['autodocs']` を meta に追加するだけで、Props テーブルと全ストーリーを含む Docs ページが自動生成される（Phase 4 で設定済み）。

### MDX でカスタムドキュメントを書く場合

```mdx
{/* components/ui/button/button.mdx */}
import { Meta, Canvas, Controls, Story } from '@storybook/blocks'
import * as ButtonStories from './button.stories'

<Meta of={ButtonStories} />

# Button

クリック可能なアクションを表現する基本コンポーネント。

## 使用指針

- **Primary**: メインのアクション（フォーム送信、ページ遷移など）
- **Secondary**: 補助的なアクション
- **Outline**: 目立たせたくない操作
- **Ghost**: 最も目立たせたくない操作（キャンセルなど）
- **Destructive**: 削除・警告を伴う操作

## インタラクティブデモ

<Canvas of={ButtonStories.Default} />
<Controls of={ButtonStories.Default} />

## 全バリアント

<Canvas of={ButtonStories.AllVariants} />

## アクセシビリティ

- アイコンのみのボタンには必ず `aria-label` を設定する
- ローディング中は `disabled` を設定し、スクリーンリーダーに状態を伝える
```

### カスタムドキュメントページ（デザインシステム概要）

```mdx
{/* src/stories/Introduction.mdx */}
import { Meta } from '@storybook/blocks'

<Meta title="Design System/Introduction" />

# デザインシステム

## デザイントークン

| カテゴリ | CSS変数 | 用途 |
|--------|--------|------|
| Brand Primary | `--color-brand-primary` | メインアクション |
| Text Primary | `--color-text-primary` | 本文テキスト |

## コンポーネント一覧

- **Atoms**: Button, Input, Label, Badge, Avatar
- **Molecules**: FormField, Select, Checkbox, Dialog, Toast
- **Organisms**: DataTable, Pagination, NavigationMenu
```

---

## Step 5-5: Storybook のビルドと公開設定

### ローカルビルド確認

```bash
pnpm build-storybook
# → storybook-static/ ディレクトリに静的ファイルが生成される

# ビルド結果をプレビュー
pnpm dlx http-server storybook-static
```

### デプロイ先の選択肢

```
1. Chromatic（推奨）
   → ビジュアルテストと Storybook のホスティングを兼ねられる
   → PR ごとに差分確認 URL を発行できる
   → `pnpm chromatic` でデプロイ

2. GitHub Pages
   → 無料でホスティング
   → GitHub Actions でビルド & デプロイを自動化

3. Vercel / Netlify
   → 簡単なセットアップ
   → storybook-static/ を公開ディレクトリに指定
```

### GitHub Pages へのデプロイ設定

```yaml
# .github/workflows/deploy-storybook.yml
name: Deploy Storybook to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm build-storybook
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: storybook-static
```

---

## Step 5-6: リリースフロー（コンポーネントライブラリとして公開する場合）

### Changesets を使ったバージョン管理

```bash
# インストール
pnpm add -D @changesets/cli

# 初期化
pnpm changeset init

# 変更を記録（PR 作成前に実行）
pnpm changeset
# → 対話式で変更内容を入力（patch/minor/major）

# バージョンを更新
pnpm changeset version

# package.json と CHANGELOG.md が更新される → コミットして PR を作成
```

### npm / GitHub Packages への公開

```bash
# ビルド
pnpm build

# npm へ公開
pnpm publish --access public

# GitHub Packages へ公開
# package.json の name を @org/package-name にする
# .npmrc に registry を設定する
```

---

## Phase 5 完了チェック

```
✅ a11y テストがパスしている（または既知の例外が文書化されている）
✅ インタラクションテストが全てパスしている
✅ Chromatic が設定されている（ビジュアルテストが有効）
✅ storybook build が成功する
✅ 主要コンポーネントにドキュメントが整備されている
✅ デプロイ先が決定・設定されている
```

すべてOKなら → **デザインシステム構築完了**
