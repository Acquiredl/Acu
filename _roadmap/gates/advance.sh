#!/usr/bin/env bash
# acu-template: advance.sh — version 2026.04.15.3
# advance.sh — Run a stage gate and update status.yaml on pass.
#
# Wraps the gate scripts so that a successful gate check automatically
# updates the initiative's status.yaml with stage completion timestamps
# and advances current_stage.
#
# Usage:
#   advance.sh [--dry-run] <initiative-dir> <transition>
#
#   --dry-run           Run all checks, print what would change, make no writes.
#
# Transitions:
#   plan-to-implement      — After planning is complete
#   implement-to-validate  — After all items are done/deferred
#   validate-complete      — After validation evidence gathered

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_ID="${ACU_SESSION:-$$}"

# --- Flag parsing ---
DRY_RUN=false
while [[ "${1:-}" == --* ]]; do
    case "$1" in
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "Unknown flag: $1"; exit 1 ;;
    esac
done

INITIATIVE_DIR="${1:?Usage: advance.sh [--dry-run] <initiative-dir> <transition>}"
TRANSITION="${2:?Specify transition: plan-to-implement | implement-to-validate | validate-complete}"
STATUS_FILE="$INITIATIVE_DIR/status.yaml"
MARKER_FILE="$INITIATIVE_DIR/.gate-${TRANSITION}.passed"

# --- Idempotency check (skipped in dry-run to allow re-verification) ---
if [[ "$DRY_RUN" == false && -f "$MARKER_FILE" ]]; then
    echo "[PASS] Transition '$TRANSITION' already completed."
    echo "Remove the marker to re-run: rm \"$MARKER_FILE\""
    exit 0
fi

# --- Map transition to gate script, completed stage, and next stage ---

case "$TRANSITION" in
    plan-to-implement)
        GATE_SCRIPT="$SCRIPT_DIR/gate-plan-to-implement.sh"
        COMPLETED_STAGE="plan"
        NEXT_STAGE="implement"
        STAGE_DIR="$PIPELINE_DIR/1-Plan"
        ;;
    implement-to-validate)
        GATE_SCRIPT="$SCRIPT_DIR/gate-implement-to-validate.sh"
        COMPLETED_STAGE="implement"
        NEXT_STAGE="validate"
        STAGE_DIR="$PIPELINE_DIR/2-Implement"
        ;;
    validate-complete)
        GATE_SCRIPT="$SCRIPT_DIR/gate-validate-complete.sh"
        COMPLETED_STAGE="validate"
        NEXT_STAGE=""
        STAGE_DIR="$PIPELINE_DIR/3-Validate"
        ;;
    *)
        echo "Unknown transition: $TRANSITION"
        echo "Valid: plan-to-implement | implement-to-validate | validate-complete"
        exit 1
        ;;
esac

# --- Parse structural check results from gate output ---
log_gate_checks() {
    local log_file="$1" audit_file="$2"
    local checks=""
    while IFS= read -r line; do
        local result desc
        if [[ "$line" =~ \[(PASS|FAIL|WARN)\]\ (.*) ]]; then
            result="${BASH_REMATCH[1]}"
            desc="${BASH_REMATCH[2]}"
            desc="${desc//\"/\\\"}"
            [[ -n "$checks" ]] && checks+=","
            checks+="{\"result\":\"$result\",\"desc\":\"$desc\"}"
        fi
    done < "$log_file"
    if [[ -n "$checks" ]]; then
        printf '{"ts":"%s","gate":"%s","layer":"structural-checks","session":"%s","checks":[%s]}\n' \
            "$TIMESTAMP" "$TRANSITION" "$SESSION_ID" "$checks" >> "$audit_file"
    fi
}

# --- Run the gate (structural) ---

GATE_LOG=$(mktemp /tmp/gate-output-XXXXXX.txt)

if ! bash "$GATE_SCRIPT" "$INITIATIVE_DIR" 2>&1 | tee "$GATE_LOG"; then
    log_gate_checks "$GATE_LOG" "$INITIATIVE_DIR/.audit-log.jsonl"
    rm -f "$GATE_LOG"
    echo ""
    echo "Status not updated — structural gate must pass first."
    exit 1
fi
log_gate_checks "$GATE_LOG" "$INITIATIVE_DIR/.audit-log.jsonl"
rm -f "$GATE_LOG"

# --- Dry-run: gate passed — report what would change, then exit without modifying files ---
if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "--- [DRY RUN] Gate passed. Changes that would be applied ---"
    echo "[DRY RUN]   $STATUS_FILE"
    if [[ -n "$NEXT_STAGE" ]]; then
        echo "[DRY RUN]   current_stage -> $NEXT_STAGE"
    else
        echo "[DRY RUN]   status -> complete"
    fi
    echo "[DRY RUN]   $COMPLETED_STAGE.status -> complete"
    echo "[DRY RUN]   $COMPLETED_STAGE.completed -> $TIMESTAMP"
    [[ -n "$NEXT_STAGE" ]] && echo "[DRY RUN]   $NEXT_STAGE.status -> in_progress"
    echo ""
    echo "[DRY RUN] No files were modified."
    exit 0
fi

# --- Update status.yaml ---

if [[ ! -f "$STATUS_FILE" ]]; then
    echo ""
    echo "[WARN] No status.yaml found at $STATUS_FILE — skipping status update"
    exit 0
fi

echo ""
echo "--- Updating status.yaml ---"

update_stage_field() {
    local stage="$1"
    local field="$2"
    local value="$3"
    local file="$4"
    awk -v stage="$stage" -v field="$field" -v value="$value" '
    BEGIN { in_stage = 0 }
    {
        if ($0 ~ "^  " stage ":") {
            in_stage = 1
            print
            next
        }
        if (in_stage && /^  [^ ]/ && $0 !~ "^    ") {
            in_stage = 0
        }
        if (in_stage && /^[a-z]/) {
            in_stage = 0
        }
        if (in_stage && $0 ~ "^    " field ":") {
            sub(/:.*/, ": \"" value "\"")
            print
            next
        }
        print
    }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
}

# Update initiative-level current_stage
if [[ -n "$NEXT_STAGE" ]]; then
    sed -i "s/current_stage:.*/current_stage: \"$NEXT_STAGE\"/" "$STATUS_FILE"
    echo "  current_stage -> $NEXT_STAGE"
else
    sed -i 's/status: "active"/status: "complete"/' "$STATUS_FILE"
    echo "  initiative status -> complete"
fi

# Update timestamp
sed -i "s/updated:.*/updated: \"$TIMESTAMP\"/" "$STATUS_FILE"

# Mark completed stage
update_stage_field "$COMPLETED_STAGE" "status" "complete" "$STATUS_FILE"
update_stage_field "$COMPLETED_STAGE" "completed" "$TIMESTAMP" "$STATUS_FILE"
echo "  $COMPLETED_STAGE.status -> complete"
echo "  $COMPLETED_STAGE.completed -> $TIMESTAMP"

# Start next stage (if not final)
if [[ -n "$NEXT_STAGE" ]]; then
    update_stage_field "$NEXT_STAGE" "status" "in_progress" "$STATUS_FILE"
    update_stage_field "$NEXT_STAGE" "entered" "$TIMESTAMP" "$STATUS_FILE"
    echo "  $NEXT_STAGE.status -> in_progress"
    echo "  $NEXT_STAGE.entered -> $TIMESTAMP"
fi

# --- Write idempotency marker ---
touch "$MARKER_FILE"
echo "  Marker: .gate-${TRANSITION}.passed"

# --- Checkpoint ---
CHECKPOINT_DIR="$INITIATIVE_DIR/.checkpoints/$TIMESTAMP"
mkdir -p "$CHECKPOINT_DIR"
cp "$STATUS_FILE" "$CHECKPOINT_DIR/status.yaml.snapshot"
find "$INITIATIVE_DIR" -maxdepth 1 -type f \( -name "*.md" -o -name "*.yaml" \) | sort | \
    while IFS= read -r f; do
        sha=$(sha256sum "$f" 2>/dev/null | awk '{print $1}' || echo "unavailable")
        size=$(wc -c < "$f" 2>/dev/null || echo "0")
        printf "%s\t%s\t%s\n" "$(basename "$f")" "$size" "$sha"
    done > "$CHECKPOINT_DIR/manifest.txt"
echo "  Checkpoint: .checkpoints/$TIMESTAMP/"

echo ""
echo "Status updated successfully."
