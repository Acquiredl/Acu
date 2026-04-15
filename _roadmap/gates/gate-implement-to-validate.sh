#!/usr/bin/env bash
# acu-template: gate.sh — version 2026.04.14.1
# Gate: Implement -> Validate
# Verify all items are done or explicitly deferred with reasons.
#
# Usage: gate-implement-to-validate.sh <initiative-dir>

set -euo pipefail

GATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INITIATIVE_DIR="${1:?Usage: gate-implement-to-validate.sh <initiative-dir>}"

PASS=true
AUDIT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_ID="${ACU_SESSION:-$$}"

echo "=== Gate: Implement -> Validate ==="
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

# Check 1: Implementation log exists
if [[ -f "$INITIATIVE_DIR/implement.md" ]]; then
    echo "[PASS] implement.md exists"
else
    echo "[FAIL] implement.md not found — implementation log required"
    PASS=false
fi

# Check 2: No items still in planned or in_progress status
if command -v yq &>/dev/null; then
    PLANNED=$(yq e '[.items[] | select(.status == "planned")] | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || PLANNED="0"
    IN_PROGRESS=$(yq e '[.items[] | select(.status == "in_progress")] | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || IN_PROGRESS="0"
    DONE=$(yq e '[.items[] | select(.status == "done")] | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || DONE="0"
    DEFERRED=$(yq e '[.items[] | select(.status == "deferred")] | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || DEFERRED="0"
    TOTAL=$(yq e '.items | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || TOTAL="0"

    echo "  Items: $DONE done, $DEFERRED deferred, $IN_PROGRESS in_progress, $PLANNED planned (total: $TOTAL)"

    if (( PLANNED > 0 )); then
        echo "[FAIL] $PLANNED item(s) still in 'planned' status"
        PASS=false
    else
        echo "[PASS] No items left in 'planned' status"
    fi

    if (( IN_PROGRESS > 0 )); then
        echo "[FAIL] $IN_PROGRESS item(s) still 'in_progress' — complete or defer before advancing"
        PASS=false
    else
        echo "[PASS] No items left 'in_progress'"
    fi
else
    echo "[WARN] yq not installed — cannot verify item statuses programmatically"
fi

# Check 3: Deferred items have reasons
if command -v yq &>/dev/null; then
    DEFERRED_NO_REASON=$(yq e '[.items[] | select(.status == "deferred" and (.deferred_reason == "" or .deferred_reason == null))] | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || DEFERRED_NO_REASON="0"
    if (( DEFERRED_NO_REASON > 0 )); then
        echo "[FAIL] $DEFERRED_NO_REASON deferred item(s) missing a deferred_reason"
        PASS=false
    elif (( DEFERRED > 0 )); then
        echo "[PASS] All deferred items have reasons"
    fi
fi

# Check 4: Done items have evidence
if command -v yq &>/dev/null; then
    DONE_NO_EVIDENCE=$(yq e '[.items[] | select(.status == "done" and (.evidence == "" or .evidence == null))] | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || DONE_NO_EVIDENCE="0"
    if (( DONE_NO_EVIDENCE > 0 )); then
        echo "[FAIL] $DONE_NO_EVIDENCE completed item(s) missing evidence (commit SHA, file path, or test result)"
        PASS=false
    elif (( DONE > 0 )); then
        echo "[PASS] All completed items have evidence"
    fi
fi

# Check 5: No TODO/FIXME markers in implementation log
if [[ -f "$INITIATIVE_DIR/implement.md" ]]; then
    TODO_COUNT=$(grep -cE "(TODO|FIXME|PLACEHOLDER)\s*:" "$INITIATIVE_DIR/implement.md" || true)
    if (( TODO_COUNT == 0 )); then
        echo "[PASS] No TODO/FIXME markers in implement.md"
    else
        echo "[FAIL] $TODO_COUNT TODO/FIXME marker(s) found in implement.md"
        PASS=false
    fi
fi

# --- Audit log ---
GATE_RESULT="$([[ "$PASS" == true ]] && echo "PASS" || echo "FAIL")"
ARTIFACT_SHA=$(sha256sum "$INITIATIVE_DIR/status.yaml" 2>/dev/null | awk '{print $1}' || true)
ARTIFACT_SHA="${ARTIFACT_SHA:-unavailable}"
printf '{"ts":"%s","gate":"implement-to-validate","result":"%s","user":"%s","session":"%s","sha256":"%s"}\n' \
    "$AUDIT_TIMESTAMP" "$GATE_RESULT" "${LOGNAME:-${USER:-unknown}}" "$SESSION_ID" "$ARTIFACT_SHA" \
    >> "$INITIATIVE_DIR/.audit-log.jsonl"

echo ""
if [[ "$PASS" == true ]]; then
    echo "GATE PASSED: Ready to proceed to Validate"
    exit 0
else
    echo "GATE FAILED: Resolve issues above before proceeding"
    exit 1
fi
