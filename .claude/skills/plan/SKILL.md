---
name: plan
description: Create a CDD (Component-Driven Development) implementation plan. Use before implementing new features or UI components. Generates a structured plan file with Atomic Design hierarchy decomposition, props design, bottom-up implementation order, Storybook story plan, and test plan.
argument-hint: <feature or component description>
allowed-tools: ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "TodoWrite", "Task", "mcp__storybook-mcp__list-all-documentation", "mcp__storybook-mcp__get-documentation"]
---

# CDD Implementation Planning

Receive a feature or component description and create a CDD-based implementation plan.

## Workflow

### Step 1: Requirements Analysis

Analyze $ARGUMENTS and clarify:

- Feature/UI overview
- User interactions
- Required data structures

Use AskUserQuestion if anything is unclear.

### Step 2: Existing Component Survey

Survey existing components using Storybook MCP and filesystem.

**Survey method (prefer Storybook MCP when available):**

1. **Storybook MCP** (primary): Call `mcp__storybook-mcp__list-all-documentation` with `withStoryIds: true` to get a complete component list with story IDs
2. **Storybook MCP** (detail): Call `mcp__storybook-mcp__get-documentation` for each candidate component to check props, variants, and usage patterns
3. **Filesystem** (supplementary): Check `components/`, `features/`, `hooks/` for components without Stories

**Survey targets:**

- `components/` — Shared UI components
- `features/` — Feature-specific components
- `hooks/` — Shared custom hooks

Prioritize reuse; minimize new creation (DRY principle). Use Storybook documentation to understand existing component APIs before designing new ones.

### Step 3: Atomic Design Component Decomposition

Decompose into the following hierarchy:

| Level | Description | Examples |
| --------- | --------------------------------- | ---------------------------------- |
| Atoms | Smallest UI elements | Button, Input, Badge |
| Molecules | Combinations of Atoms | SearchBar, FormField |
| Organisms | Complex UI sections | WorkFilter, ProfileCard |
| Pages | Full page composition (no Story) | WorkListPage |

**Criteria:**

- Single Responsibility Principle — each component does one thing only
- Avoid duplication with existing components
- Align component granularity with the data model

### Step 4: Props Design

Design the props interface for each component.

**Conventions:**

- Boolean props use `is`, `has`, `can` prefix
- Callback props use `on` prefix
- Include `className` prop for external style extension
- Identify variants to manage with CVA

### Step 5: Determine Implementation Order

Determine bottom-up implementation order:

```
1. AtomA (static UI) -> Story -> Test
2. AtomB (static UI) -> Story -> Test
3. MoleculeA (static UI) -> Story -> Test
4. Add dynamic UI (state, events) -> play function tests
5. OrganismA -> Story -> Test
6. PageA (no Story/tests needed)
```

### Step 6: Test & Story Plan

Determine Story and test strategy for each component:

| Test Type | Target | Tool |
| ------------------ | -------------------- | ---------------------- |
| Unit tests | All components | Jest + Testing Library |
| Interaction tests | Dynamic components | Storybook play functions |
| VRT | All Stories | Chromatic |

### Step 7: Output Plan File

Output the plan file in the following format:

- **Location**: `.claude/plans/`
- **Filename**: `YYYY-MM-DD-HHMMSS-{identifier}.plan.md`

---

## Plan File Template

Output the plan file with the following structure:

**Heading**: `# Implementation Plan: {feature name}`

**Section structure:**

1. **Overview** — Feature description
2. **Component Decomposition** — List component name, new/existing, and responsibility for each Atoms / Molecules / Organisms / Pages
3. **Props Design** — TypeScript type definitions for each component
4. **Implementation Order** — Numbered list with checkboxes for each step per component:
   - `[ ] Static UI implementation (index.tsx)`
   - `[ ] Story creation (index.stories.tsx)`
   - `[ ] Unit test (index.test.tsx)`
   - `[ ] Add dynamic UI (hooks.ts)` — if needed
   - `[ ] Interaction test (play function)` — if needed
5. **Storybook Plan** — Table with Story names and play function availability
6. **Test Plan** — Table with test aspects
7. **Custom Hook Plan** — Hook name, responsibility, and location
8. **Notes** — Additional considerations

---

## Plan Checklist

Verify before output:

- [ ] Classified by Atomic Design hierarchy
- [ ] Reuse of existing components considered
- [ ] Implementation order is bottom-up
- [ ] Props designed for each component
- [ ] Storybook Stories planned (except Pages)
- [ ] Test plan included
- [ ] Custom hook extraction planned (if needed)

## Next Step

After creating the plan, start implementation with the `/impl` command.
