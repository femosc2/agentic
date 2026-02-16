# Agentic

An automated coding task system. Users submit feedback via a web UI, and a pipeline of AI agents transforms it into working code.

```
┌──────────┐     ┌──────────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────┐
│  User    │     │  PO Agent    │     │   Architect   │     │  Developer    │     │  GitHub  │
│ feedback │────▶│ (draft task) │────▶│   (analyze)   │────▶│   (execute)   │────▶│    PR    │
└──────────┘     └──────────────┘     └───────────────┘     └───────────────┘     └──────────┘
  email/form        Claude AI           Claude Code CLI        Claude Code CLI       auto-created
```

## Structure

```
apps/
├── tasks/     # Task Management UI (React + Firebase)
└── client/    # Agent Service (Node.js + Claude Code CLI)
```

### apps/tasks

Web interface for creating tasks, sending emails (Fmail), and submitting feedback (Fforms). Also hosts the Product Owner and Architect agents.

- **Stack**: React 19, TypeScript, Vite, Firebase (Auth + Firestore), SCSS modules
- **Deployed to**: https://agentic-tasks.web.app

### apps/client

Background service that polls Firestore for pending tasks, executes them via Claude Code CLI, and creates GitHub PRs with the changes.

- **Stack**: Node.js, TypeScript, Firebase, Claude Code CLI, GitHub CLI

## Getting Started

```bash
# Install all dependencies (npm workspaces)
npm install

# Start the Task UI
npm run dev -w apps/tasks

# Start the agents (each in a separate terminal)
npm run agent:po -w apps/tasks         # Product Owner agent
npm run agent:architect -w apps/tasks   # Architect agent
npm run agent -w apps/client            # Developer agent
```

## Agent Pipeline

| Agent | Polls for | Creates | Promotes to |
|-------|-----------|---------|-------------|
| **Product Owner** | Unprocessed emails/forms | Draft task with user story + acceptance criteria | `draft` |
| **Architect** | Draft tasks | Architect review (impacted files, complexity, notes) | `pending` |
| **Developer** | Pending tasks | Git branch, code changes, GitHub PR | `completed` |

## Environment

Both apps need a `.env` file. See `.env.example` in each app directory.

Key variables:
- `VITE_FIREBASE_*` — Firebase project config
- `AGENT_WORKING_DIR` — Path to the target repo for the Architect/Developer agents

## Common Commands

```bash
npm run dev -w apps/tasks        # Start task UI dev server
npm run build -w apps/tasks      # Production build
npm run lint -w apps/tasks       # Run linter
npm run agent -w apps/client     # Start developer agent
npm run agent:po -w apps/tasks   # Start PO agent
npm run agent:architect -w apps/tasks  # Start Architect agent
```
