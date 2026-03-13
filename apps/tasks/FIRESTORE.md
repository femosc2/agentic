# Firestore Schema

Firebase project: `agentic-tasks`

---

## Collections

### `tasks`

The central collection. Every document represents one coding task moving through the pipeline.

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Short imperative task title |
| `description` | `string?` | Detailed instructions, user story, acceptance criteria |
| `status` | `string` | See status lifecycle below |
| `userId` | `string` | UID of the user who created or owns the task |
| `userDisplayName` | `string \| null` | Display name at time of creation |
| `userPhotoUrl` | `string \| null` | Avatar URL at time of creation |
| `source` | `'user' \| 'product-owner'` | Whether created manually or by the PO agent |
| `sourceRef` | `string?` | ID of the originating email or form (PO-generated tasks only) |
| `architectReview` | `object?` | Set by the Architect agent — see below |
| `result` | `object?` | Set by the Developer agent on completion — see below |
| `createdAt` | `Timestamp` | Firestore server timestamp |
| `updatedAt` | `Timestamp` | Updated on every status transition |

#### `architectReview` (nested object)

| Field | Type | Description |
|-------|------|-------------|
| `complexity` | `'low' \| 'medium' \| 'high'` | Determines agent behavior — see routing below |
| `impactedFiles` | `string[]` | File paths expected to need changes |
| `repos` | `string[]` | Repository names affected |
| `notes` | `string` | Actionable implementation notes for the Developer agent |
| `analyzedAt` | `Timestamp` | When the architect analysis was completed |

#### `result` (nested object)

| Field | Type | Description |
|-------|------|-------------|
| `branchName` | `string` | Git branch created for this task (`task/{taskId}`) |
| `commitHash` | `string` | SHA of the commit |
| `prUrl` | `string?` | GitHub PR URL (absent if push or PR creation failed) |
| `error` | `string?` | Error message if the task failed |

#### Status lifecycle

```
draft → pending → in_progress → completed
                             └→ failed
                             └→ awaiting_developer
```

| Status | Set by | Meaning |
|--------|--------|---------|
| `draft` | PO agent | Task generated from email/form, not yet analyzed |
| `pending` | Architect agent (low/medium) or user (manual tasks) | Ready for the Developer agent |
| `awaiting_developer` | Architect agent (high complexity) | Needs a human developer |
| `in_progress` | Developer agent | Claimed and currently being executed |
| `completed` | Developer agent | Code committed, PR created (and merged if low complexity) |
| `failed` | Developer agent | Execution or git workflow failed |

#### Complexity routing

| Complexity | Next status after architect | Developer agent behavior |
|------------|-----------------------------|--------------------------|
| `low` | `pending` | Executes, creates PR, auto-merges |
| `medium` | `pending` | Executes, opens PR for review |
| `high` | `awaiting_developer` | Skipped by agent entirely |

---

### `emails`

Submitted via the Fmail page. Unprocessed entries are picked up by the Product Owner agent.

| Field | Type | Description |
|-------|------|-------------|
| `to` | `string` | Recipient email address |
| `subject` | `string` | Email subject line |
| `body` | `string` | Email body content |
| `userId` | `string` | UID of the submitting user |
| `userDisplayName` | `string \| null` | Display name at submission time |
| `userPhotoUrl` | `string \| null` | Avatar URL at submission time |
| `processed` | `boolean` | `false` until the PO agent converts it to a task |
| `taskId` | `string?` | ID of the generated task (set after processing) |
| `createdAt` | `Timestamp` | Submission time |

---

### `forms`

Submitted via the Fforms page. Unprocessed entries are picked up by the Product Owner agent.

| Field | Type | Description |
|-------|------|-------------|
| `type` | `'feature' \| 'bug'` | Type of feedback |
| `title` | `string` | Short summary |
| `description` | `string` | Full description of the feature or bug |
| `userId` | `string` | UID of the submitting user |
| `userDisplayName` | `string \| null` | Display name at submission time |
| `userPhotoUrl` | `string \| null` | Avatar URL at submission time |
| `processed` | `boolean` | `false` until the PO agent converts it to a task |
| `taskId` | `string?` | ID of the generated task (set after processing) |
| `createdAt` | `Timestamp` | Submission time |

---

## Security Rules

Defined in `firestore.rules`.

| Collection | Authenticated users | Agents (unauthenticated) |
|------------|--------------------|-----------------------------|
| `tasks` | Read/write/delete own tasks (`userId == auth.uid`) | Create `draft` tasks; read/update `draft` and `pending` tasks |
| `emails` | Read/delete own emails; create with own `userId` | Read unprocessed (`processed == false`); update any |
| `forms` | Read/delete own forms; create with own `userId` | Read unprocessed (`processed == false`); update any |

> **Note**: The `processed` field check uses `resource.data.get('processed', false)` rather than direct equality to handle documents created before the field existed.
