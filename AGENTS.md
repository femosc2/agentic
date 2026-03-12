# Agents

Three agents run in sequence to process tasks automatically.

```
email/form → [Product Owner] → [Architect] → [Developer] → [Monitor]
                 (draft)         (pending)    (in_progress)  (completed)
```

---

## Product Owner Agent

**Location**: `apps/tasks`
**Purpose**: Polls unprocessed emails and forms, converts them into structured draft tasks (with user story and acceptance criteria) using Claude.

```bash
npm run agent:po -w apps/tasks
```

---

## Architect Agent

**Location**: `apps/tasks`
**Purpose**: Picks up draft tasks, analyzes the codebase, assigns complexity (`low` / `medium` / `high`), and promotes tasks to `pending` or `awaiting_developer`.

```bash
npm run agent:architect -w apps/tasks
```

---

## Monitor Agent

**Location**: `apps/tasks`
**Purpose**: Polls for `in_progress` tasks and checks GitHub for a merged PR on the `task/{taskId}` branch. When found, marks the task as `completed` with the PR URL and commit hash.

```bash
npm run agent:monitor -w apps/tasks
```

---

## Developer Agent

**Location**: `apps/client`
**Purpose**: Picks up `pending` tasks, runs Claude Code to implement the changes, commits, and handles the PR based on complexity:

| Complexity | Behavior |
|------------|----------|
| `low` | Executes task, creates PR, **auto-merges** |
| `medium` | Executes task, opens PR for review |
| `high` | Skipped — task stays `awaiting_developer` for a human |

```bash
npm run agent -w apps/client
```

---

## Running All Agents

Each agent is a long-running process. Run them in separate terminal tabs:

```bash
# Tab 1
npm run agent:po -w apps/tasks

# Tab 2
npm run agent:architect -w apps/tasks

# Tab 3
npm run agent -w apps/client

# Tab 4
npm run agent:monitor -w apps/tasks
```

## Required Environment Variables

All agents require a `.env` file in their respective app directory. See `.env.example` in each app for the full list. Key variables:

| Variable | Used by | Purpose |
|----------|---------|---------|
| `VITE_FIREBASE_*` | all | Firebase project config |
| `ANTHROPIC_API_KEY` | Developer | Claude Code access |
| `GH_TOKEN` | Developer | GitHub PAT for creating/merging PRs |
| `TARGET_REPO_URL` | Developer | Repository the agent modifies |
| `AGENT_WORKING_DIR` | all | Local path to the target repository |
| `VITE_GITHUB_OWNER` | Monitor | Reuses existing value — GitHub username owning the target repo |
| `VITE_GITHUB_REPO` | Monitor | Reuses existing value — repository name to watch for merged PRs |
