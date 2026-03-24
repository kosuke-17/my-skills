# my-skills

## スキルの追加方法

### スクリプトを使う（推奨）

`move-skill.sh` を使うと、スキルのシンボリックリンクを自動で作成できます。

```bash
# 対話形式でスキルを選択してシンボリックリンクを作成
./move-skill.sh .claude/skills

# スキルを指定してシンボリックリンクを作成
./move-skill.sh .claude/skills frontend-dev-workflow

# 名前空間付きスキル
./move-skill.sh .claude/skills best-practices/rails

# 全スキルを一括追加
./move-skill.sh --all .claude/skills

# ファイルとしてコピー（シンボリックリンクでなく実体をコピー）
./move-skill.sh --copy .claude/skills frontend-dev-workflow
```

> **注意**: 既にスキルが存在する場合はスキップされます。上書きするには `--force` オプションを使用してください。

### 手動でシンボリックリンクを作成する

1. 該当のskillsディレクトリを作成する

```bash
# .claudeの場合
mkdir -p .claude/skills

# .cursorの場合
mkdir -p .cursor/skills
```

2. シンボリックリンクのコマンドを実行

```bash
# .claudeの場合
ln -s /Users/okamurakosuke/my-skills/.agents/skills/frontend-dev-workflow /Users/okamurakosuke/my-skills/.claude/skills/frontend-dev-workflow

# .cursorの場合
ln -s /Users/okamurakosuke/my-skills/.agents/skills/frontend-dev-workflow /Users/okamurakosuke/my-skills/.cursor/skills/frontend-dev-workflow
```
