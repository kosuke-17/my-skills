---
name: fix
description: Fix issues detected by /eval. Prioritize, analyze root causes, fix, and re-verify each issue from the evaluation report until all automated checks (TypeScript, ESLint, Jest, Storybook) pass. Pass evaluation report path as argument. Uses latest evaluation report if omitted.
argument-hint: [evaluation report path]
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "TodoWrite", "mcp__storybook-mcp__run-story-tests", "mcp__storybook-mcp__get-storybook-story-instructions", "mcp__storybook-mcp__preview-stories"]
---

# CDD Issue Fixing

Fix issues from the evaluation report and pass all checks.

## Loading the Evaluation Report

- With argument: Read the path from `$ARGUMENTS`
- Without argument: Use the latest evaluation report

Latest evaluation report: !`ls -t .claude/plans/*.eval.md 2>/dev/null | head -1 || echo "No evaluation reports found in .claude/plans/. Run /eval first."`

If no evaluation report is found, instruct the user to run `/eval` first.

---

## Fix Workflow

### Step 1: Classify and Prioritize Issues

Classify issues from the "Detected Issues" section by priority and register them in TodoWrite:

| Priority | Category | Reason |
| -------- | ---------------------- | -------------------------------- |
| 1 | TypeScript type errors | Can cause cascading errors |
| 2 | ESLint errors | Code quality foundation |
| 3 | Jest test failures | Functional correctness |
| 4 | Storybook build errors | UI verification foundation |
| 5 | CDD compliance issues | Architecture quality |

### Step 2: Fix Issues

Execute the following cycle for each issue:

1. **Root cause analysis**: Read the relevant file and identify the root cause
2. **Fix**: Resolve the issue with minimal changes
3. **Targeted verification**: Re-run the check related to the fixed issue

#### TypeScript Type Errors

```bash
pnpm tsc --noEmit 2>&1
```

Common causes and fixes:

- Missing props type definitions -> Add types
- Import path mismatch -> Fix `@/` aliases
- Strict mode violations -> Add null/undefined checks

#### ESLint Errors

```bash
# Attempt auto-fix
pnpm lint --fix 2>&1
# Check remaining errors
pnpm lint 2>&1
```

Common causes and fixes:

- Boolean naming violation -> Add `is`/`has`/`can` prefix
- Unused variables -> Remove
- Import order -> Auto-format with Prettier

#### Jest Test Failures

```bash
pnpm test -- --testPathPattern="{component-name}" 2>&1
```

Common causes and fixes:

- Tests not updated after component changes -> Update tests
- Mock mismatch -> Fix mocks
- Insufficient async waiting -> Use `waitFor` / `findBy*`

#### Storybook Story Errors

Use Storybook MCP for faster feedback:

1. Call `mcp__storybook-mcp__get-storybook-story-instructions` to check correct Story conventions
2. Fix the Story file
3. Call `mcp__storybook-mcp__run-story-tests` for the specific story to verify the fix
4. Call `mcp__storybook-mcp__preview-stories` to confirm rendering

Fallback: `pnpm storybook build --test 2>&1`

Common causes and fixes:

- Import errors -> Fix paths
- args/props type mismatch -> Fix Story types
- CSF format issues -> Check Meta/StoryObj definitions

#### CDD Compliance Issues

- Unnecessary state -> Convert to props or derived values
- Logic inside component -> Extract to custom hook
- Missing Story variations -> Add Stories

### Step 3: Re-run All Checks

After fixing all issues, re-run all checks:

```bash
pnpm tsc --noEmit 2>&1
pnpm lint 2>&1
pnpm test --passWithNoTests 2>&1
pnpm storybook build --test 2>&1
```

### Step 4: Verify Results

- **All checks pass**: Fix complete. Report to user.
- **Unresolved issues remain**: Return to Step 2 and fix remaining issues.
- **3+ loops**: Report the situation to the user and discuss the approach.

---

## Fix Principles

- **Minimal changes**: Only make changes necessary to fix the issue
- **No new issues**: Confirm fixes don't affect other areas
- **Preserve CDD principles**: Confirm fixes don't break CDD architecture

## Next Step

- **All checks pass**: Re-run `/eval` for final confirmation, or proceed to commit.
- **Issues unresolved**: Report the situation to the user and discuss the approach.
