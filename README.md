# my-skills

## シンボリックリンクの作成の仕方

1. 該当のskillsディレクトリを作成する()

```bash
# .claudeの場合
mkdir .claude
mkdir .claude/skills

# .cursorの場合
mkdir .cursor
mkdir .cursor/skills
```

2. シンボリックリンクのコマンドを実行

```bash
# .claudeの場合
ln -s /Users/okamurakosuke/my-skills/.agents/skills/frontend-dev-workflow /Users/okamurakosuke/my-skills/.claude/skills/frontend-dev-workflow

# .cursorの場合
ln -s /Users/okamurakosuke/my-skills/.agents/skills/frontend-dev-workflow /Users/okamurakosuke/my-skills/.cursor/skills/frontend-dev-workflow
```
