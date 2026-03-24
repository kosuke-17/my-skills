---
name: best-practices/storybook
description: StorybookのStoryファイルをベストプラクティスに基づいてレビュー・評価、またはコンポーネント情報からStoryテンプレートを生成するスキル。「Storyをレビューしてほしい」「Storyを書いてほしい」「Storyのテンプレートを作りたい」「Storybookのベストプラクティスを確認したい」「CSF3形式でStoryを生成してほしい」などのリクエスト時に使用する。React + TypeScript (CSF3形式) を前提とするが、他フレームワークにも応用可能。
---

# Storybookベストプラクティス & Storyテンプレート生成

Storybookの **2つのモード** でサポートするスキル:
1. **Reviewモード**: 既存Storyファイルをベストプラクティスに照らしてレビュー
2. **Generateモード**: コンポーネント情報から高品質なStoryファイルを生成

## 前提技術スタック

- React + TypeScript (strict mode)
- Storybook v8 (CSF3形式)
- Tailwind CSS または CSS変数
- Vite または Next.js

> ユーザーが異なるスタックを指定した場合はそちらに合わせる。

---

## モード選択

リクエスト内容から自動的にモードを判定する:

| リクエスト例 | モード |
|------------|------|
| 「このStoryファイルをレビューして」 | Reviewモード |
| 「Storyを書いて / 生成して」 | Generateモード |
| 「ButtonのStoryテンプレートが欲しい」 | Generateモード |
| 「ベストプラクティスに沿っているか確認して」 | Reviewモード |

---

## Reviewモード

### レビュープロセス

1. **対象ファイルの確認**
   - レビュー対象のStoryファイルを読む
   - コンポーネントファイルも合わせて確認する

2. **ベストプラクティスファイルを参照**
   - 全般的なベストプラクティス → [best-practices.md](references/best-practices.md)
   - UIプリミティブのテンプレートと基準 → [ui-primitives-templates.md](references/ui-primitives-templates.md)
   - Story品質チェックリスト → [story-checklist.md](references/story-checklist.md)

3. **ベストプラクティスに基づいて評価**
   - チェックリストを使って漏れなく確認
   - アンチパターンを特定

4. **フィードバックを提供**

### フィードバックフォーマット

- 🔴 **Critical**: 修正必須（誤動作・ドキュメント生成失敗・型エラーの原因）
- 🟡 **Suggestion**: 改善を推奨（カバレッジ不足・ArgTypes未設定・命名の問題）
- 🟢 **Nice to have**: 任意の改善（Play関数の追加・AllVariants story等）

各フィードバックには:
- 該当するベストプラクティス名
- 問題の説明
- 具体的なコード例（該当箇所）
- 改善案（可能な場合）

### レビューチェックリスト

- [ ] **CSF3形式**: `satisfies Meta<typeof Component>` を使用しているか
- [ ] **自動ドキュメント**: `tags: ['autodocs']` が設定されているか
- [ ] **ストーリー命名**: PascalCase、Default必須、意味のある名前か
- [ ] **ArgTypes**: 主要なPropsにcontrolとdescriptionが設定されているか
- [ ] **カバレッジ**: Default・全バリアント・disabled状態が揃っているか
- [ ] **アクセシビリティ**: a11y違反を引き起こすような実装になっていないか

---

## Generateモード

### 生成プロセス

1. **コンポーネント情報の確認**
   - コンポーネント名（例: Button, Input）
   - コンポーネントファイルのパスまたは内容
   - Props定義・バリアント・状態（ファイルから読み取れない場合はユーザーに確認）

2. **コンポーネント種別の判定と参照ファイルの選択**
   - UIプリミティブ（Button / Input / Select / Checkbox / Badge）→ [ui-primitives-templates.md](references/ui-primitives-templates.md)
   - その他のコンポーネント → [best-practices.md](references/best-practices.md) のテンプレートを応用

3. **Storyファイルの生成**
   - 対応するテンプレートをベースにコンポーネントの実際のPropsに合わせて生成
   - [story-checklist.md](references/story-checklist.md) で生成内容を確認
   - 生成後、カバレッジに不足がないか確認する

4. **生成結果の説明**
   - 生成したストーリーの一覧と各ストーリーの意図を簡潔に説明する

---

## 参照ファイル一覧

| 用途 | 参照ファイル |
|------|-----------|
| ベストプラクティス全般 | [references/best-practices.md](references/best-practices.md) |
| UIプリミティブ テンプレート | [references/ui-primitives-templates.md](references/ui-primitives-templates.md) |
| Story品質チェックリスト | [references/story-checklist.md](references/story-checklist.md) |

**各モード実行時、必ず対応する参照ファイルを読んでから実行すること。**

---

## 拡張ガイド

新しいコンポーネント種別のテンプレートを追加する場合:
1. `references/` に `{種別}-templates.md` を追加
2. このSKILL.mdのモード選択テーブルとGenerateプロセスに追記

追加候補:
- `form-components-templates.md` — FormField, バリデーション付きフォーム
- `overlay-templates.md` — Modal/Dialog, Tooltip, Popover
- `data-display-templates.md` — Table, Card, List
