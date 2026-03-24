---
name: storybook
description: Storybookのコンポーネントストーリー作成に関するベストプラクティスとテンプレートを提供するスキル。「Storyを書きたい」「Storybookのベストプラクティスを教えて」「StorybookにStoryを追加して」「play関数の書き方を知りたい」「ArgTypesを設定したい」「Decoratorを追加したい」「インタラクションテストを書きたい」などのリクエスト時に使用する。Storybook v8 + CSF3 (Component Story Format 3) を前提とする。
---

# Storybook ベストプラクティス

コンポーネントに対して **質の高い Story を書く** ための実践ガイド。
CSF3 形式・ArgTypes・play 関数・Decorator のパターンをカバーする。

---

## Story 作成フロー

対象コンポーネントを受け取ったら以下の順番で進める:

1. **meta を設定する** → `references/csf3-template.md`
   - title・component・tags・parameters・argTypes を設定

2. **Default ストーリーを作成する**
   - 最もシンプルな状態を一番最初に定義する

3. **全バリアント・全状態のストーリーを網羅する**
   - variant・size・loading・disabled・error の組み合わせを揃える

4. **ArgTypes と Controls を整備する** → `references/argtypes.md`
   - Props の型に応じた control 設定・非表示設定

5. **インタラクションが必要なストーリーに play 関数を追加する** → `references/play-functions.md`
   - フォーム入力・クリック・キーボード操作・非同期処理

6. **Context Provider が必要なら Decorator を追加する** → `references/decorators.md`
   - Theme / Router / i18n / Query など

---

## Story 作成チェックリスト

コンポーネントごとに以下を確認する:

```
必須
□ Default ストーリーがある
□ tags: ['autodocs'] が設定されている
□ 全バリアントのストーリーがある
□ Disabled 状態のストーリーがある
□ ArgTypes と Controls が設定されている

フォーム系コンポーネント
□ Error 状態のストーリーがある
□ フォーム送信のインタラクションテスト（play 関数）がある
□ バリデーションエラー表示のストーリーがある

非同期・ローディング状態があるコンポーネント
□ Loading 状態のストーリーがある
□ Empty 状態のストーリーがある（データ 0 件）

モーダル・ドロワー・オーバーレイ系
□ 開いた状態のストーリーがある
□ 開閉インタラクション（play 関数）のストーリーがある

コンポーネント種別ごとのテンプレート → `references/story-patterns.md`
```

---

## ストーリー命名規則

```
✅ 良い命名（PascalCase）
Default          → デフォルト状態（必ず最初に定義する）
Primary          → variant="primary" の状態
Secondary        → variant="secondary" の状態
Disabled         → disabled 状態
Loading          → ローディング中
WithError        → エラー表示あり
WithIcon         → アイコン付き
AllVariants      → 全バリアント比較用（render で並べる）
LongText         → 長いテキスト時の挙動確認
Empty            → データなし状態
OpenState        → 開いた状態（モーダル・ドロップダウン等）

❌ 悪い命名
Test1            → 意味が不明
ButtonPrimary    → コンポーネント名の繰り返し
button_primary   → snake_case は使わない
```

---

## 参照ファイル一覧

| 内容 | ファイル |
|-----|---------|
| CSF3 基本テンプレート・meta 設定 | `references/csf3-template.md` |
| ArgTypes / Controls の全設定パターン | `references/argtypes.md` |
| play 関数・インタラクションテスト | `references/play-functions.md` |
| Decorator パターン集 | `references/decorators.md` |
| コンポーネント種別ごとのテンプレート | `references/story-patterns.md` |

**Story を書く際は、対象コンポーネントの種類に応じて参照ファイルを読んでから実装すること。**
