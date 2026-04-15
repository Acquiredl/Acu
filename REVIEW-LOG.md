# Context Review Log

Tracks when automated context reviews have run and what was changed. The scheduled review task reads this to know which session files have already been analyzed.

## Format

```
### [YYYY-MM-DD] Review — [Workspace Name]
**Sessions reviewed:** list of session filenames
**Changes made:** summary of CLAUDE.md updates (or "none suggested")
```

---

*No reviews yet. The first review triggers after 10 session files accumulate across all workspaces.*

---

### Audit Log Patterns

*Data sourced from `/acu-pulse`. Updated during each review sweep.*

*(No audit log pattern analysis completed yet. First analysis will run during the next scheduled review.)*
