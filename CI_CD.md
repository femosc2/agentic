# CI/CD Pipelines

Both apps have GitHub Actions workflows defined at the monorepo root in `.github/workflows/`. GitHub only reads workflows from this location, so app-level `.github/` directories are not used.

| Workflow file | App |
|---------------|-----|
| `.github/workflows/deploy-tasks.yml` | `apps/tasks` |
| `.github/workflows/deploy-client.yml` | `apps/client` |

---

## Trigger Events

Each workflow only fires when files within its own app directory change, preventing unnecessary builds.

| Event | Branch | Paths | Jobs that run |
|-------|--------|-------|---------------|
| Push | `main` | `apps/tasks/**` or `apps/client/**` | `build` → `deploy-production` |
| Pull request | targeting `main` | `apps/tasks/**` or `apps/client/**` | `build` → `deploy-preview` |

---

## Jobs

### 1. `build` (runs on every trigger)

Runs on `ubuntu-latest` with `working-directory` set to the app subdirectory. Steps:

1. Checkout repository
2. Set up Node.js 20 with npm cache
3. `npm ci` — install dependencies
4. `npm run lint` — ESLint must pass
5. `npm run test:run` — runs Vitest once (`continue-on-error: true`, so a test failure does not block deployment)
6. `npm run build` — Vite production build, with all `VITE_FIREBASE_*` secrets injected as environment variables
7. Upload `dist/` as a named build artifact (`tasks-dist` or `client-dist`)

### 2. `deploy-preview` (PRs only)

Runs after `build` succeeds, only when the trigger is a pull request.

- Downloads the app's `dist/` artifact
- Deploys to a **Firebase preview channel** (expires after 7 days)
- Posts a preview URL as a comment on the PR via `GITHUB_TOKEN`

### 3. `deploy-production` (merge to main only)

Runs after `build` succeeds, only when a commit is pushed to `main`.

- Downloads the app's `dist/` artifact
- Deploys to the **live Firebase Hosting channel**

---

## Per-App Deployment Targets

The `entryPoint` field tells the Firebase deploy action where to find `firebase.json` within the monorepo.

| App | Firebase project | Hosting target | `entryPoint` | Live URL |
|-----|-----------------|----------------|--------------|----------|
| `apps/tasks` | `agentic-tasks` | default | `apps/tasks` | https://agentic-tasks.web.app |
| `apps/client` | `agentic-tasks` | `agentic-client` | `apps/client` | Firebase Hosting (agentic-client site) |

Both apps share the same Firebase project (`agentic-tasks`) but deploy to separate hosting sites.

---

## Flow in Context of the Agent Pipeline

When the developer agent merges a `low` complexity PR (or a human merges a `medium`/`high` one), the pipeline fires automatically:

```
PR merged to main
      ↓
build job (lint → test → vite build)
      ↓
deploy-production job
      ↓
Live site updated
```

---

## Required GitHub Secrets

These must be set in the `femosc2/agentic` repository settings (Settings → Secrets and variables → Actions):

| Secret | Purpose |
|--------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON for Firebase Hosting deploys |
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions — used for PR preview comments |
