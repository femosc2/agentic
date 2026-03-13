# apps/tasks — Task Management UI & Agent Pipeline

This app serves two distinct purposes: it is the **web interface** where users create and monitor coding tasks, and it also hosts the **Product Owner** and **Architect** agents that form the first two stages of the automated pipeline.

**Deployed at**: https://agentic-tasks.web.app

---

## Web UI

### Authentication

Login is handled via GitHub OAuth through Firebase Auth. The `AuthProvider` wraps the app and exposes the current user via `useAuth`. Only authenticated users can create tasks or view task details.

### Pages

| Page | Route | Purpose |
|------|-------|---------|
| `TasksPage` | `/` | Create tasks manually and monitor all task statuses |
| `CommitsPage` | `/commits` | View merged commits from the target repository via GitHub API |
| `FmailPage` | `/fmail` | Submit feedback by email — feeds into the Product Owner agent |
| `FformsPage` | `/fforms` | Submit feedback via form — feeds into the Product Owner agent |

### Task Lifecycle (UI perspective)

Tasks move through the following statuses, all visible in real time via Firestore listeners:

```
draft → pending → in_progress → completed
                             └→ failed
                             └→ awaiting_developer  (high complexity — needs human)
```

Each task card (`TaskItem`) shows:
- Status badge
- Architect review section (complexity, impacted files, notes) once analyzed
- PR link when completed
- Error message if failed

### Task Creation & Validation

Tasks created manually via `TaskForm` go directly to `pending` (skipping `draft`). The form runs client-side validation (`taskValidation.ts`) before submission, blocking tasks that match dangerous patterns (secret exposure, auth removal, destructive operations, etc.).

### Key Services

| Service | Purpose |
|---------|---------|
| `taskService.ts` | Firestore CRUD for tasks |
| `emailService.ts` | Writes submitted emails to Firestore (`emails` collection) |
| `formService.ts` | Writes submitted forms to Firestore (`forms` collection) |
| `githubService.ts` | Fetches commit history from GitHub API for the Commits page |

---

## Agents

Both agents run as local Node.js processes (not deployed). They share utilities in `src/agents/shared/`.

### Product Owner Agent

**Script**: `npm run agent:po`
**Entry**: `src/agents/productOwner/index.ts`

Polls the `emails` and `forms` Firestore collections for unprocessed entries. For each one, it calls Claude to generate a structured task with a title, user story, and acceptance criteria, then writes a `draft` task to Firestore and marks the source entry as processed.

### Architect Agent

**Script**: `npm run agent:architect`
**Entry**: `src/agents/architect/index.ts`

Polls for `draft` tasks. For each one, it calls Claude to analyze the target codebase and produce a JSON review containing impacted files, affected repositories, complexity rating, and architectural notes. It then updates the task in Firestore:

- `low` or `medium` complexity → status becomes `pending` (developer agent picks it up)
- `high` complexity → status becomes `awaiting_developer` (left for a human)

### Shared Agent Utilities

| File | Purpose |
|------|---------|
| `shared/claudeRunner.ts` | Spawns Claude Code CLI via stdin pipe, parses JSON from output |
| `shared/poller.ts` | Reusable polling loop factory used by both agents |
| `config/firebaseAdmin.ts` | Firebase client SDK init for agent use (reads from `.env`) |

---

## Project Structure

```
src/
├── agents/
│   ├── architect/          # Architect agent
│   ├── productOwner/       # Product Owner agent
│   ├── shared/             # claudeRunner, poller
│   └── config/             # Firebase init for agents
├── components/
│   ├── CommitItem/
│   ├── CommitList/
│   ├── EmailForm/
│   ├── EmailList/
│   ├── FormEntry/
│   ├── FormList/
│   ├── Header/
│   ├── Markdown/           # Lightweight markdown renderer for task descriptions
│   ├── TaskForm/
│   ├── TaskItem/
│   ├── TaskList/
│   └── UserMenu/
├── context/                # AuthContext + AuthProvider
├── hooks/                  # useAuth, useCommits
├── pages/
│   ├── CommitsPage/
│   ├── FformsPage/
│   ├── FmailPage/
│   └── TasksPage/
├── services/               # Firestore + GitHub API services
├── types/                  # task, email, form, commit, user
└── utils/                  # taskValidation
```

---

## Tech Stack

- **Framework**: React 19, TypeScript, Vite
- **Auth & DB**: Firebase Auth (GitHub OAuth), Firestore
- **Styling**: SCSS Modules
- **Routing**: React Router v7
- **Agents**: Node.js, tsx, Claude Code CLI
- **Deployment**: Firebase Hosting

---

## Local Development

```bash
cd apps/tasks
cp .env.example .env   # fill in Firebase config
npm install
npm run dev            # start web UI on localhost:5173
```

To run the agents locally (in separate terminals):

```bash
npm run agent:po        # Product Owner agent
npm run agent:architect # Architect agent
```
