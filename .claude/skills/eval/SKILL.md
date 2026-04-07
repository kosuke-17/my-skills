---
name: eval
description: Evaluate CDD implementation quality (artifact evaluation). Run TypeScript type checking, ESLint, Jest tests, and Storybook build, verify CDD compliance, and output a structured report. Use after /impl or whenever quality verification is needed.
allowed-tools: ["Bash", "Read", "Write", "Glob", "Grep", "TodoWrite", "mcp__storybook-mcp__run-story-tests", "mcp__storybook-mcp__preview-stories", "mcp__storybook-mcp__list-all-documentation"]
---

# CDD Quality Evaluation (Artifact Evaluation)

Evaluate implemented components from multiple quality perspectives and generate a report. This is artifact-level evaluation; autonomy quality is assessed separately by the autonomy-review skill.

## Check Plan File

Latest plan file: !`ls -t .claude/plans/*.plan.md 2>/dev/null | head -1 || echo "None"`

If a plan file exists, read it to identify the target components.

---

## Evaluation Workflow

Track each check with TodoWrite.

### Check 1: TypeScript Type Check

```bash
pnpm tsc --noEmit 2>&1
```

Verification points:

- Zero type errors
- No usage of `any` type
- Strict mode compliance

### Check 2: ESLint

```bash
pnpm lint 2>&1
```

Verification points:

- Zero ESLint errors
- Boolean naming convention (is/has/can) compliance

### Check 3: Jest Tests

```bash
pnpm test --passWithNoTests 2>&1
```

Verification points:

- All tests pass
- Tests exist for target components

### Check 4: Storybook Story Tests (via MCP)

Use Storybook MCP for faster, more detailed verification instead of a full build.

1. Call `mcp__storybook-mcp__list-all-documentation` with `withStoryIds: true` to verify Stories exist for target components
2. Call `mcp__storybook-mcp__run-story-tests` for target component stories (with `a11y: true`) to run component and accessibility tests
3. Call `mcp__storybook-mcp__preview-stories` for target stories to verify rendering

Verification points:

- Stories exist for all target components
- All story tests pass (component + a11y)
- Stories render correctly

Fallback: If Storybook is not running, use `pnpm storybook build --test 2>&1`

### Check 5: CDD Compliance Review

In addition to automated checks, read the source code of target components and verify:

| Aspect | Verification |
| --------------- | ------------------------------------------------- |
| Static UI | UI complete with props only (no unnecessary state) |
| Logic separation | Logic separated into custom hooks |
| Story quality | All variations covered |
| Test quality | Arrange-Act-Assert structure used |
| Accessibility | Role-based queries used |

---

## Report Output

After all checks are complete, generate a report.

- **Location**: `.claude/plans/`
- **Filename**: `YYYY-MM-DD-HHMMSS-{identifier}.eval.md`

### Report Structure

Output with the following structure:

**Heading**: `# Evaluation Report: {feature name}`

**Section structure:**

1. **Summary** — Table with results (pass/fail) and error counts for each check (TypeScript / ESLint / Jest / Storybook)
2. **Overall Verdict** — `PASS` or `FAIL`. PASS only when all checks pass
3. **Detected Issues** (FAIL only) — For each issue:
   - Category (TypeScript / ESLint / Jest / Storybook / CDD compliance)
   - File path:line number
   - Issue details
   - Recommended fix
4. **CDD Compliance Check** — Table with static UI / Story / test / hook separation status per component
5. **Next Action** — If FAIL, run `/fix`; if PASS, proceed to autonomy review (optional) or commit

---

## Verdict Criteria

### PASS Conditions

All must be satisfied:

- TypeScript: Zero errors
- ESLint: Zero errors (warnings allowed)
- Jest: All tests pass
- Storybook: Build succeeds
- CDD compliance: All components conform to conventions

### FAIL Conditions

Any of the above not satisfied.

## Next Step

- **PASS**: Implementation complete. Proceed to autonomy review (optional) or commit/push.
- **FAIL**: Fix detected issues with the `/fix` command.
