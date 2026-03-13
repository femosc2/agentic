# Completed Tasks & Learnings

## Tasks Completed

### 1. Product Owner & Architect Agent Pipeline
**Date**: 2026-02-16

Implemented an automated pipeline that transforms user feedback into actionable development tasks:

```
email/form → PO Agent (draft task) → Architect Agent (analyze + promote) → Developer Agent (execute)
```

**Files created:**
- `src/agents/config/firebaseAdmin.ts` — Firebase client SDK init from .env
- `src/agents/shared/poller.ts` — Reusable polling loop factory
- `src/agents/shared/claudeRunner.ts` — Claude Code CLI invocation + JSON parser
- `src/agents/productOwner/index.ts` + `poService.ts` — PO agent
- `src/agents/architect/index.ts` + `architectService.ts` — Architect agent
- `src/components/Markdown/index.tsx` + `styles.module.scss` — Markdown renderer

**Files modified:**
- `src/types/task.ts` — Added `draft` status, `ArchitectReview`, `source`/`sourceRef`
- `src/types/email.ts` — Added `processed`, `taskId`
- `src/types/form.ts` — Added `processed`, `taskId`
- `src/services/emailService.ts` — Sets `processed: false` on create
- `src/services/formService.ts` — Sets `processed: false` on create
- `src/components/TaskItem/index.tsx` — Draft badge, auto-generated badge, architect review section, markdown descriptions
- `src/components/TaskItem/styles.module.scss` — Styles for new UI elements
- `tsconfig.app.json` — Excludes `src/agents` from browser build
- `package.json` — Added `dotenv`, `tsx`, `@types/node`, agent scripts
- `firebase.json` — Added firestore rules reference
- `firestore.rules` — Agent access rules
- `.env.example` — Added `AGENT_WORKING_DIR`

---

### 2. Complexity-Based Task Routing
**Date**: 2026-03-12

The architect agent now routes tasks based on complexity instead of always setting them to `pending`:

- **low** → `pending` → developer agent picks up, executes, creates PR, and **auto-merges** it
- **medium** → `pending` → developer agent picks up, executes, opens PR for human review
- **high** → `awaiting_developer` → agent skips it entirely; a human developer handles it manually

**Files modified:**
- `src/types/task.ts` — Added `awaiting_developer` to `TaskStatus`
- `src/agents/architect/architectService.ts` — Sets status to `awaiting_developer` for high complexity tasks

---

## Learnings

### Firebase Client SDK vs Admin SDK
- **Don't use `firebase-admin` unless you have a service account.** Initializing with just `projectId` gives `PERMISSION_DENIED` because there are no credentials.
- The regular `firebase` client SDK works fine for agents — it authenticates via the web API key from `.env`.
- The existing developer agent in `agentic-test-client` already uses this pattern.

### Firestore Security Rules for Agents
- Agents run unauthenticated. Rules must explicitly allow agent operations.
- `resource.data.processed == false` fails for old documents missing the `processed` field (evaluates to `null == false`). Use `resource.data.get('processed', false) == false` instead.
- For multi-step updates (transaction sets `processed: true`, then later update adds `taskId`), the update rule must allow updates regardless of current `processed` value.
- Rules are OR'd: multiple `allow` statements for the same operation combine permissively.

### ES Module Import Hoisting
- With ES modules, `import` statements are hoisted. If `firebaseAdmin.ts` is imported, it runs before any `dotenvConfig()` call in the entry point.
- Solution: Load `dotenv` inside `firebaseAdmin.ts` itself so env vars are available when the module initializes.

### Claude Code Nested Session Detection
- Claude Code sets a `CLAUDECODE` env var. If spawned from within a Claude Code session, the child process inherits it and refuses to start.
- Fix: `delete spawnEnv.CLAUDECODE` before spawning. Don't use destructuring (`const { CLAUDECODE, ...rest }`) — linters may revert unused variable assignments.

### TypeScript Config for Mixed Browser/Node Projects
- Agent code uses Node.js APIs (`child_process`, `fs`) but lives in the same `src/` as browser code.
- Add `"exclude": ["src/agents"]` to `tsconfig.app.json` so `tsc` doesn't try to compile agents with browser settings.
- Agents run via `tsx` which handles TypeScript independently.

### Markdown in Task Descriptions
- PO-generated tasks contain markdown (##, -, **bold**). A simple custom `<Markdown>` component handles headings, bullets, bold, and code without adding a heavy dependency.
