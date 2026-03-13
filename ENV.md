# Environment Variables

Both apps require a `.env` file in their respective directories. Copy `.env.example` and fill in the values.

---

## apps/tasks

Used by both the **web UI** (Vite, prefixed `VITE_`) and the **PO/Architect agents** (Node.js, no prefix required for agent-only vars).

| Variable | Required | Used by | Description |
|----------|----------|---------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | UI + agents | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | UI + agents | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | UI + agents | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | UI + agents | e.g. `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | UI + agents | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | UI + agents | Firebase app ID |
| `VITE_GITHUB_OWNER` | No | UI (Commits page) | GitHub username or org owning the target repo |
| `VITE_GITHUB_REPO` | No | UI (Commits page) | Repository name to fetch commits from |
| `VITE_GITHUB_BRANCH` | No | UI (Commits page) | Branch to show commits for (default: `master`) |
| `AGENT_WORKING_DIR` | Yes (agents) | Architect agent | Absolute path to the locally cloned target repository |
| `ARCHITECT_POLL_INTERVAL` | No | Architect agent | Polling interval in ms (default: `30000`) |

Where to find Firebase values: Firebase Console → Project Settings → General → Your apps → Web app → SDK setup and configuration.

---

## apps/client

Used by the **Developer agent** (Node.js). The `VITE_` prefix is kept for consistency since the app also has a React frontend, but all variables are available to the agent.

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | e.g. `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase app ID |
| `ANTHROPIC_API_KEY` | Yes | Enables Claude Code CLI — get from console.anthropic.com |
| `GH_TOKEN` | Yes | GitHub personal access token with `repo` scope — used for creating and merging PRs via `gh` CLI |
| `TARGET_REPO_URL` | Yes | Remote URL of the repository the agent modifies (e.g. `https://github.com/user/repo.git`) |
| `AGENT_WORKING_DIR` | Yes | Absolute local path to the cloned target repository |
| `AGENT_POLL_INTERVAL` | No | Polling interval in ms (default: `10000`) |

---

## Notes

- **Never commit `.env` files.** Both apps have `.env` in `.gitignore`.
- `VITE_` prefixed variables are embedded into the browser bundle at build time by Vite. Do not put secrets that should stay server-side under this prefix.
- The `GH_TOKEN` must also be available to the `gh` CLI in the shell environment where the Developer agent runs. The agent does not pass it explicitly — `gh` picks it up from the environment automatically.
- `AGENT_WORKING_DIR` in `apps/tasks` is used by the **Architect agent** to analyze the target codebase. `AGENT_WORKING_DIR` in `apps/client` is used by the **Developer agent** to apply changes. Both should point to the same locally cloned target repository.
