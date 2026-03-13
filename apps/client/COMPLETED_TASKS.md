# Completed Tasks & Learnings

## Tasks Completed

### 1. Architect Review Integration in Developer Agent
**Date**: 2026-02-16

Updated the task executor to include architect analysis in the Claude Code prompt, giving the developer agent full context about impacted files, complexity, and architectural notes.

**Files modified:**
- `src/types/task.ts` — Added `draft` status, `ArchitectReview` interface, `source`/`sourceRef`/`architectReview` fields
- `src/services/taskExecutor.ts` — Appends architect review to prompt, strips `CLAUDECODE` env var

---

### 2. Complexity-Based PR Handling
**Date**: 2026-03-12

The developer agent now behaves differently based on the architect's complexity assessment:

- **low** → auto-merges the PR after creation (`gh pr merge --merge --delete-branch`)
- **medium** → opens a PR and leaves it for review (unchanged behavior)
- **high** → task is set to `awaiting_developer` by the architect; agent never claims it

**Files modified:**
- `src/types/task.ts` — Added `awaiting_developer` to `TaskStatus`
- `src/services/gitService.ts` — Added `mergePullRequest()` function
- `src/services/agentService.ts` — Auto-merges PR when `complexity === 'low'`

---

## Learnings

### CLAUDECODE Environment Variable
- When running `npm run agent` from a terminal where Claude Code is active, the `CLAUDECODE` env var is inherited by child processes.
- Claude Code detects this and blocks execution to prevent nested sessions.
- Fix: Remove the variable from the spawned process env using `delete spawnEnv.CLAUDECODE`.
- **Do not use destructuring** (`const { CLAUDECODE, ...rest } = process.env`) — ESLint's `noUnusedLocals` will flag the unused variable, and auto-fix may revert the change.

### Architect Context Improves Task Execution
- Including impacted files and complexity in the prompt helps Claude Code focus on the right files immediately instead of exploring the entire codebase.
- The architect notes provide implementation hints that reduce hallucination and unnecessary changes.

### Task Type Alignment
- The `Task` type must stay in sync between `agentic-test-tasks` (where tasks are created) and `agentic-test-client` (where tasks are consumed).
- New fields like `architectReview` should be optional (`?`) to maintain backward compatibility with existing tasks.
