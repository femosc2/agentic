# apps/client — Target App & Developer Agent

This app serves two distinct purposes: it is the **target React application** that the automated pipeline modifies, and it hosts the **Developer agent** — the final stage of the pipeline — which claims tasks, runs Claude Code to implement them, and handles the resulting git workflow.

---

## Target Application

This is the React app that gets modified by the developer agent when tasks are executed. It starts as a minimal scaffold, and new features are added to it automatically over time as tasks are completed.

### Current Features

- `Header` — top navigation bar
- `Footer` — page footer
- `TicTacToe` — game component (added via the agent pipeline as a test task)

### Running the App

```bash
cd apps/client
npm install
npm run dev   # starts on localhost:5173
```

---

## Developer Agent

**Script**: `npm run agent`
**Entry**: `src/agent/index.ts`

The developer agent is a long-running background process that polls Firestore for `pending` tasks and executes them automatically.

### How It Works

1. **Poll** — queries Firestore every 30s for a `pending` task
2. **Claim** — atomically sets the task to `in_progress` via a Firestore transaction (prevents double-claiming if multiple agents run)
3. **Branch** — checks out the default branch, pulls latest, creates `task/{taskId}`
4. **Execute** — runs Claude Code CLI with the task description and safety rules prepended
5. **Finalize** — stages all changes, commits, pushes branch, creates a PR on GitHub
6. **Merge** — behavior depends on architect-assigned complexity:

| Complexity | Outcome |
|------------|---------|
| `low` | PR created and **auto-merged** |
| `medium` | PR opened for human review |
| `high` | Task was never set to `pending` — agent never sees it |

7. **Update** — writes final status (`completed` or `failed`) and result (branch, commit hash, PR URL) back to Firestore

### Safety Rules

Every task prompt is prefixed with `SAFETY_RULES` (`src/agent/safetyRules.ts`) which instructs Claude Code to refuse:

- Accessing or exposing environment variables or secrets
- Modifying authentication or security rules
- Destructive operations (`rm -rf`, dropping collections, wiping data)
- Reading credential files or SSH keys
- Installing global packages or modifying git/npm config

Tasks are also pre-validated against a list of dangerous regex patterns before Claude Code is even invoked. If a pattern matches, the task is immediately failed without execution.

### Key Services

| File | Purpose |
|------|---------|
| `services/taskPoller.ts` | Firestore query + atomic claim transaction, status updates |
| `services/taskExecutor.ts` | Builds prompt, writes to temp file, spawns Claude Code via stdin pipe |
| `services/agentService.ts` | Orchestrates the full task lifecycle (poll → execute → git → update) |
| `services/gitService.ts` | All git and GitHub CLI operations (checkout, branch, commit, push, PR, merge) |
| `agent/safetyRules.ts` | Safety prompt prefix + dangerous pattern validation |
| `agent/config.ts` | Loads agent config from environment variables |

---

## Project Structure

```
src/
├── agent/
│   ├── index.ts            # Entry point — starts polling
│   ├── config.ts           # Env-based config (poll interval, working dir)
│   └── safetyRules.ts      # Safety prompt + dangerous pattern list
├── components/
│   ├── Footer/
│   ├── Header/
│   └── TicTacToe/
├── config/
│   └── firebase.ts         # Firebase client init
├── services/
│   ├── agentService.ts     # Main orchestration loop
│   ├── gitService.ts       # Git + GitHub CLI operations
│   ├── taskExecutor.ts     # Claude Code invocation
│   └── taskPoller.ts       # Firestore polling + claim logic
└── types/
    └── task.ts             # Task, TaskStatus, TaskResult, ArchitectReview
```

---

## Tech Stack

- **Target App**: React 19, TypeScript, Vite, SCSS Modules
- **Agent Runtime**: Node.js, tsx
- **AI**: Claude Code CLI (`claude -p --dangerously-skip-permissions`)
- **Version Control**: Git, GitHub CLI (`gh`)
- **Database**: Firebase Firestore

---

## Environment Variables

Create a `.env` file in this directory (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_*` | Firebase project config |
| `ANTHROPIC_API_KEY` | Enables Claude Code CLI |
| `GH_TOKEN` | GitHub PAT with `repo` scope — used for creating and merging PRs |
| `TARGET_REPO_URL` | Remote URL of the repository the agent modifies |
| `AGENT_WORKING_DIR` | Absolute local path to the cloned target repository |
| `AGENT_POLL_INTERVAL` | Polling interval in ms (default: `10000`) |

---

## Running the Agent

```bash
cd apps/client
cp .env.example .env   # fill in all required variables
npm install
npm run agent
```

The agent will log each poll cycle and print detailed output from Claude Code as it executes tasks.
