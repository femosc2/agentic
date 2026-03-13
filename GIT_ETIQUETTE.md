# Git Etiquette

## Commit Message Structure

```
<type>: <short description>

- Optional bullet summarizing a key change
- Another bullet if multiple distinct changes

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>  ← if AI-assisted
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or behaviour |
| `fix` | Bug fix |
| `chore` | Maintenance, config, tooling |
| `docs` | Documentation only |
| `refactor` | Code restructure with no behaviour change |
| `test` | Adding or updating tests |

### Rules

- **Subject line**: lowercase after the type prefix, no trailing period, max ~72 chars
- **Body**: use `-` bullets to explain *what* changed and *why*, not *how*
- **Body is optional** for simple single-purpose commits
- **Co-authored-by**: include when the commit was written with AI assistance

### Examples

**Simple commit (no body needed):**
```
chore: add .firebase to gitignore
```

**Feature with context:**
```
feat: include architect review in task execution prompt

- Add ArchitectReview interface and new fields to Task type
- Include architect analysis (impacted files, complexity, notes) in
  the Claude Code prompt so the developer agent has full context
- Remove CLAUDECODE env var from spawned process to prevent nested
  session detection

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Docs commit:**
```
docs: add monorepo README with pipeline overview and setup guide

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
