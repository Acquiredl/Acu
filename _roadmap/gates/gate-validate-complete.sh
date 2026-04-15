#!/usr/bin/env bash
# acu-template: gate.sh — version 2026.04.14.1
# Gate: Validate -> Complete
# Verify validation evidence exists and ROADMAP.md is updated.
#
# Usage: gate-validate-complete.sh <initiative-dir>

set -euo pipefail

GATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INITIATIVE_DIR="${1:?Usage: gate-validate-complete.sh <initiative-dir>}"

PASS=true
AUDIT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_ID="${ACU_SESSION:-$$}"

echo "=== Gate: Validate -> Complete ==="
echo "Initiative: $INITIATIVE_DIR"
echo ""

# --- Paused check ---
if command -v yq &>/dev/null; then
    UNIT_STATUS=$(yq e '.initiative.status // ""' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || UNIT_STATUS=""
else
    UNIT_STATUS=$(grep -m1 "status:" "$INITIATIVE_DIR/status.yaml" 2>/dev/null | sed 's/.*status:[[:space:]]*//' | tr -d '"' || true)
fi
if [[ "$UNIT_STATUS" == "paused" ]]; then
    echo "[FAIL] Work unit is paused — resume before advancing"
    exit 1
fi

# --- Schema validation helper ---
validate_yaml_schema() {
    local file="$1" schema="$2" fail=false field val fields
    if ! command -v yq &>/dev/null; then
        echo "[WARN] yq not installed — schema validation skipped for $(basename "$file")"
        return 0
    fi
    [[ -f "$schema" ]] || { echo "[WARN] Schema not found: $(basename "$schema") — skipping"; return 0; }
    fields=$(yq e '.required[]' "$schema" 2>/dev/null) || { echo "[WARN] Cannot parse schema $(basename "$schema") — skipping"; return 0; }
    while IFS= read -r field; do
        [[ -z "$field" ]] && continue
        val=$(yq e ".$field // \"\"" "$file" 2>/dev/null) || val=""
        if [[ -z "$val" ]]; then
            echo "[FAIL] Schema: $(basename "$file") missing required field: $field"
            fail=true
        fi
    done <<< "$fields"
    if [[ "$fail" == true ]]; then return 1; fi
    echo "[PASS] $(basename "$file") passes schema validation"
}

# --- Schema validation ---
if ! validate_yaml_schema "$INITIATIVE_DIR/intake.yaml" \
    "$GATE_DIR/../templates/intake.schema.yaml"; then
    PASS=false
fi
if ! validate_yaml_schema "$INITIATIVE_DIR/status.yaml" \
    "$GATE_DIR/../templates/status.schema.yaml"; then
    PASS=false
fi

# --- Gate checks ---

# Check 1: Validation deliverable exists
if [[ -f "$INITIATIVE_DIR/validate.md" ]]; then
    echo "[PASS] validate.md exists"
else
    echo "[FAIL] validate.md not found — validation evidence required"
    PASS=false
fi

# Check 2: Validation is not empty
if [[ -f "$INITIATIVE_DIR/validate.md" ]]; then
    VAL_LINES=$(wc -l < "$INITIATIVE_DIR/validate.md" 2>/dev/null || echo "0")
    if (( VAL_LINES > 5 )); then
        echo "[PASS] validate.md has content ($VAL_LINES lines)"
    else
        echo "[FAIL] validate.md appears empty or minimal ($VAL_LINES lines)"
        PASS=false
    fi
fi

# Check 3: ROADMAP.md exists and references this initiative
ROADMAP_FILE="$GATE_DIR/../ROADMAP.md"
if [[ -f "$ROADMAP_FILE" ]]; then
    INIT_NAME=$(basename "$INITIATIVE_DIR")
    if grep -qi "$INIT_NAME" "$ROADMAP_FILE"; then
        echo "[PASS] ROADMAP.md references $INIT_NAME"
    else
        echo "[FAIL] ROADMAP.md does not reference $INIT_NAME — update the master index"
        PASS=false
    fi
else
    echo "[FAIL] ROADMAP.md not found"
    PASS=false
fi

# Check 4: No TODO/FIXME markers in validation
if [[ -f "$INITIATIVE_DIR/validate.md" ]]; then
    TODO_COUNT=$(grep -cE "(TODO|FIXME|PLACEHOLDER)\s*:" "$INITIATIVE_DIR/validate.md" || true)
    if (( TODO_COUNT == 0 )); then
        echo "[PASS] No TODO/FIXME markers in validate.md"
    else
        echo "[FAIL] $TODO_COUNT TODO/FIXME marker(s) found in validate.md"
        PASS=false
    fi
fi

# Check 5: All stage deliverables present (plan, implement, validate)
ALL_DELIVERABLES=true
for deliverable in plan.md implement.md validate.md; do
    if [[ ! -f "$INITIATIVE_DIR/$deliverable" ]]; then
        echo "[FAIL] Missing stage deliverable: $deliverable"
        ALL_DELIVERABLES=false
        PASS=false
    fi
done
if [[ "$ALL_DELIVERABLES" == true ]]; then
    echo "[PASS] All stage deliverables present"
fi

# --- Audit log ---
GATE_RESULT="$([[ "$PASS" == true ]] && echo "PASS" || echo "FAIL")"
ARTIFACT_SHA=$(sha256sum "$INITIATIVE_DIR/status.yaml" 2>/dev/null | awk '{print $1}' || true)
ARTIFACT_SHA="${ARTIFACT_SHA:-unavailable}"
printf '{"ts":"%s","gate":"validate-complete","result":"%s","user":"%s","session":"%s","sha256":"%s"}\n' \
    "$AUDIT_TIMESTAMP" "$GATE_RESULT" "${LOGNAME:-${USER:-unknown}}" "$SESSION_ID" "$ARTIFACT_SHA" \
    >> "$INITIATIVE_DIR/.audit-log.jsonl"

echo ""
if [[ "$PASS" == true ]]; then
    echo "GATE PASSED: Initiative complete"
    exit 0
else
    echo "GATE FAILED: Resolve issues above before proceeding"
    exit 1
fi
