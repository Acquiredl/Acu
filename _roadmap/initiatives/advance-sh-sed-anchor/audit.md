# Audit — sed patterns in advance.sh

**Item:** audit-sed-patterns
**Scope:** every `sed -i` call in the four advance.sh files currently in the repo (two framework-level, two generated pipeline copies).
**Date:** 2026-04-17

---

## In-scope files (framework-level — this initiative fixes)

| File | Line | Current regex | Risk | Anchored replacement |
|------|------|---------------|------|----------------------|
| `_roadmap/gates/advance.sh` | 179 | `s/current_stage:.*/current_stage: "$NEXT_STAGE"/` | Medium | `s/^  current_stage:.*/  current_stage: "$NEXT_STAGE"/` |
| `_roadmap/gates/advance.sh` | 187 | `s/updated:.*/updated: "$TIMESTAMP"/` | **High** | `s/^  updated:.*/  updated: "$TIMESTAMP"/` |
| `_templates/advance.sh.template` | 333 | `s/current_stage:.*/current_stage: "$NEXT_STAGE"/` | Medium | `s/^  current_stage:.*/  current_stage: "$NEXT_STAGE"/` |
| `_templates/advance.sh.template` | 336 | `s/status: "active"/status: "complete"/` | Low | `s/^  status: "active"/  status: "complete"/` |
| `_templates/advance.sh.template` | 341 | `s/updated:.*/updated: "$TIMESTAMP"/` | **High** | `s/^  updated:.*/  updated: "$TIMESTAMP"/` |

Note: `_roadmap/gates/advance.sh` has no `status: "active"` line because its `validate-complete` path writes `status -> complete` via the `else` branch only when `NEXT_STAGE` is empty — same logic as the template, but inline at line 182 (verified by Read at lines 178–184). The template's layout is identical, just at different line numbers.

Correction to the earlier observation: the framework `_roadmap/gates/advance.sh` DOES have the `status: "active"` sed at line 182. Verified:

```
179:    sed -i "s/current_stage:.*/current_stage: \"$NEXT_STAGE\"/" "$STATUS_FILE"
...
182:    sed -i 's/status: "active"/status: "complete"/' "$STATUS_FILE"
...
187: sed -i "s/updated:.*/updated: \"$TIMESTAMP\"/" "$STATUS_FILE"
```

So the corrected fix table for `_roadmap/gates/advance.sh` is three lines, not two:

| File | Line | Current regex | Risk | Anchored replacement |
|------|------|---------------|------|----------------------|
| `_roadmap/gates/advance.sh` | 179 | `s/current_stage:.*/...` | Medium | `s/^current_stage:.*/...` |
| `_roadmap/gates/advance.sh` | 182 | `s/status: "active"/status: "complete"/` | Low | `s/^  status: "active"/  status: "complete"/` |
| `_roadmap/gates/advance.sh` | 187 | `s/updated:.*/...` | **High** | `s/^updated:.*/...` |

Plan scope increments by +1 sed line. Total fix surface = 6 sed lines across two files.

---

## Out-of-scope files (generated pipeline copies — reached via /acu-update)

Evidence that the same bug class exists in the copies; documented for the CHANGELOG patch:

| File | Line | Pattern | Notes |
|------|------|---------|-------|
| `pipelines/SboxDevKit/gates/advance.sh` | 353 | `s/current_stage:.*/...` | Same bug; fixed by `/acu-update` on the regenerate patch. |
| `pipelines/SboxDevKit/gates/advance.sh` | 356 | `s/status: "active"/...` | Same. |
| `pipelines/SboxDevKit/gates/advance.sh` | 361 | `s/updated:.*/...` | Same. |
| `pipelines/CareerLaunch/gates/advance.sh` | 338 | `s/current_stage:.*/...` | Same. |
| `pipelines/CareerLaunch/gates/advance.sh` | 341 | `s/status: "active"/...` | Same. |
| `pipelines/CareerLaunch/gates/advance.sh` | 346 | `s/updated:.*/...` | Same. |

These are NOT force-patched by this initiative. The CHANGELOG entry lands a `regenerate_from_template` patch; users run `/acu-update` to adopt.

---

## Risk class legend

- **High** — pattern's key string (`updated:`) plausibly appears inside indented evidence/prose. Confirmed corruption observed this session. Must fix.
- **Medium** — pattern's key string (`current_stage:`) is framework vocabulary that could appear in prose describing gate behavior (e.g., evidence fields in future initiatives that discuss stage transitions). No observed corruption yet, but the bug class is identical.
- **Low** — pattern's key string (`status: "active"`) is a distinctive literal; unlikely but not impossible in prose. Fix for consistency.

---

## Success check

- Every `sed -i` hit in the two framework files enumerated above. ✅
- Every high/medium risk scheduled for fix in Item 2 (anchor-fix). ✅
- Low-risk hits also scheduled (consistency). ✅
- Pipeline copies documented but explicitly out of scope for force-migration. ✅
