#!/usr/bin/env bash
# acu-template: gate.sh — version 2026.04.14.1
# Gate: Plan -> Implement
# Verify initiative is fully scoped with items, dependencies, and phase ordering.
#
# Usage: gate-plan-to-implement.sh <initiative-dir>

set -euo pipefail

GATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INITIATIVE_DIR="${1:?Usage: gate-plan-to-implement.sh <initiative-dir>}"

PASS=true
AUDIT_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_ID="${ACU_SESSION:-$$}"

echo "=== Gate: Plan -> Implement ==="
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

# Check 1: Plan deliverable exists
if [[ -f "$INITIATIVE_DIR/plan.md" ]]; then
    echo "[PASS] plan.md exists"
else
    echo "[FAIL] plan.md not found — planning deliverable required"
    PASS=false
fi

# Check 2: Plan is not empty
if [[ -f "$INITIATIVE_DIR/plan.md" ]]; then
    PLAN_LINES=$(wc -l < "$INITIATIVE_DIR/plan.md" 2>/dev/null || echo "0")
    if (( PLAN_LINES > 5 )); then
        echo "[PASS] plan.md has content ($PLAN_LINES lines)"
    else
        echo "[FAIL] plan.md appears empty or minimal ($PLAN_LINES lines)"
        PASS=false
    fi
fi

# Check 3: Source handoff referenced in intake
if command -v yq &>/dev/null; then
    SOURCE_PATH=$(yq e '.source.path // ""' "$INITIATIVE_DIR/intake.yaml" 2>/dev/null) || SOURCE_PATH=""
else
    SOURCE_PATH=$(grep -m1 "path:" "$INITIATIVE_DIR/intake.yaml" 2>/dev/null | sed 's/.*path:[[:space:]]*//' | tr -d '"' || true)
fi
if [[ -n "$SOURCE_PATH" ]]; then
    echo "[PASS] Source handoff referenced: $SOURCE_PATH"
else
    echo "[FAIL] No source handoff path in intake.yaml"
    PASS=false
fi

# Check 4: Items defined in status.yaml
if command -v yq &>/dev/null; then
    ITEM_COUNT=$(yq e '.items | length' "$INITIATIVE_DIR/status.yaml" 2>/dev/null) || ITEM_COUNT="0"
else
    ITEM_COUNT=$(grep -c "^  [a-zA-Z0-9]" "$INITIATIVE_DIR/status.yaml" 2>/dev/null || echo "0")
fi
if (( ITEM_COUNT > 0 )); then
    echo "[PASS] $ITEM_COUNT items tracked in status.yaml"
else
    echo "[FAIL] No items found in status.yaml — items must be defined before implementation"
    PASS=false
fi

# Check 5: No WIP markers in plan
if [[ -f "$INITIATIVE_DIR/plan.md" ]]; then
    TODO_COUNT=$(grep -cE "(TODO|FIXME|PLACEHOLDER)\s*:" "$INITIATIVE_DIR/plan.md" || true)
    if (( TODO_COUNT == 0 )); then
        echo "[PASS] No TODO/FIXME markers in plan.md"
    else
        echo "[FAIL] $TODO_COUNT TODO/FIXME marker(s) found in plan.md"
        PASS=false
    fi
fi

# --- Audit log ---
GATE_RESULT="$([[ "$PASS" == true ]] && echo "PASS" || echo "FAIL")"
ARTIFACT_SHA=$(sha256sum "$INITIATIVE_DIR/status.yaml" 2>/dev/null | awk '{print $1}' || true)
ARTIFACT_SHA="${ARTIFACT_SHA:-unavailable}"
printf '{"ts":"%s","gate":"plan-to-implement","result":"%s","user":"%s","session":"%s","sha256":"%s"}\n' \
    "$AUDIT_TIMESTAMP" "$GATE_RESULT" "${LOGNAME:-${USER:-unknown}}" "$SESSION_ID" "$ARTIFACT_SHA" \
    >> "$INITIATIVE_DIR/.audit-log.jsonl"

echo ""
if [[ "$PASS" == true ]]; then
    echo "GATE PASSED: Ready to proceed to Implement"
    exit 0
else
    echo "GATE FAILED: Resolve issues above before proceeding"
    exit 1
fi
