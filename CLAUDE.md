# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## User Flow (End-to-End)

### 1. Create a Task (Task Web UI)
1. Go to https://agentic-tasks.web.app
2. Log in with GitHub OAuth
3. Click **Create Task**
4. Fill in:
   - **Title**: e.g., "Add a health check endpoint"
   - **Description**: Detailed instructions for Claude Code
5. Submit — task status becomes `pending`

### 2. Agent Picks Up Task (Automatic)
The agent (run locally) polls Firestore every 30 seconds:
1. Claims the task → status becomes `in_progress`
2. Creates branch `task/{taskId}`
3. Runs Claude Code CLI with the task description
4. Commits changes
5. Pushes branch and creates PR on GitHub
6. Updates task → status becomes `completed` with PR URL

### 3. Review & Merge (Manual)
1. Task UI shows the **PR URL** when completed
2. Go to GitHub, review the changes
3. Approve and **merge** the PR
4. CI/CD triggers deployment automatically

### 4. Verify
- Check the Commits page in the Task UI to see merged changes
- Deployed app reflects the new changes

---

## Deployment Info

- **Task UI**: Firebase Hosting at https://agentic-tasks.web.app
- **Agent**: Run locally via `npm run agent -w apps/client`
- **Target Repo**: https://github.com/femosc2/apps/client.git (branch: master)

---

## Repository Overview

This is a monorepo for an **automated coding task system**. Users create tasks via a web UI, and an agent automatically executes them using Claude Code CLI.

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  apps/tasks │     │      Firestore      │     │ apps/client │
│    (Task Web UI)    │────▶│   (Task Database)   │◀────│   (Agent Service)   │
│                     │     │                     │     │                     │
│ - Create tasks      │     │ - tasks collection  │     │ - Polls for tasks   │
│ - View task status  │     │ - user auth         │     │ - Runs Claude Code  │
│ - See commit history│     │                     │     │ - Creates PRs       │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

---

## Services

### 1. apps/tasks (Task Management UI)

**Purpose**: Web interface for creating and monitoring coding tasks.

**Features**:
- GitHub OAuth login via Firebase Auth
- Create tasks with title and description
- View task status (pending → in_progress → completed/failed)
- See task results (branch name, PR URL)
- Commits page showing repository history

**Tech**: React 19, TypeScript, Vite, Firebase, React Router

**Run locally**:
```bash
cd apps/tasks
npm install
npm run dev
```

**Deployed to**: Firebase Hosting (`agentic-tasks` project)

---

### 2. apps/client (Agent Service)

**Purpose**: Background service that processes tasks automatically.

**How it works**:
1. Polls Firestore every 30s for pending tasks
2. Claims a task (atomic transaction)
3. Creates a feature branch (`task/{taskId}`)
4. Executes task via Claude Code CLI with safety rules
5. Commits changes, pushes, creates PR
6. Updates task status with results

**Key files**:
- `src/agent/index.ts` - Entry point
- `src/services/agentService.ts` - Main orchestration
- `src/services/taskExecutor.ts` - Claude Code invocation
- `src/services/gitService.ts` - Git/GitHub operations
- `src/agent/safetyRules.ts` - Task validation & safety constraints

**Run locally**:
```bash
cd apps/client
npm install
npm run agent
```

**Run as**: Local process (not deployed remotely)

**Required environment**:
- `VITE_FIREBASE_*` - Firebase config
- `ANTHROPIC_API_KEY` - For Claude Code
- `GH_TOKEN` - GitHub PAT with `repo` scope
- `TARGET_REPO_URL` - Repository to modify
- `AGENT_WORKING_DIR` - Local path to target repo

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7, SCSS modules
- **Backend**: Firebase (Auth, Firestore)
- **Agent**: Node.js, Claude Code CLI, Git, GitHub CLI
- **Testing**: Vitest, Testing Library
- **Linting**: ESLint 9 (flat config)
- **Deployment**: Firebase Hosting (Task UI), Agent runs locally

## Common Commands

```bash
# In either project directory:
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run test       # Run tests (watch mode)
npm run test:run   # Run tests once

# Or use workspace flag from root:
npm run dev -w apps/tasks
npm run agent -w apps/client
```

## Architecture Notes

### Component Structure
```
components/
└── ComponentName/
    ├── index.tsx              # Implementation
    ├── styles.module.scss     # Scoped styles
    └── ComponentName.test.tsx # Tests
```

### Task Flow
```
User creates task → Firestore (pending)
                         ↓
Agent claims task → Firestore (in_progress)
                         ↓
Agent executes via Claude Code
                         ↓
Agent commits & creates PR
                         ↓
Agent updates → Firestore (completed/failed)
                         ↓
User sees result in UI
```

### Safety Rules
The agent enforces strict safety constraints:
- No environment variable access
- No credential/secret modifications
- No destructive operations (rm -rf, etc.)
- No system configuration changes
- Tasks are pre-validated before execution
