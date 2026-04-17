#!/usr/bin/env bash
# Regression harness for advance-sh-sed-anchor.
#
# Tests two things:
#   1. The FIXED sed pattern (with ^) preserves evidence-field prose that
#      contains the literal key strings 'updated:', 'current_stage:', or
#      'status: "active"'. Top-level fields still update correctly.
#   2. The UNFIXED pattern (without ^) corrupts the evidence prose —
#      proving the test is real, not a tautology.
#
# Usage:
#   bash regression-test.sh
#
# Exit code 0 = all assertions passed (fix works + bug reproduced on unfixed).
# Exit code 1 = at least one assertion failed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="$SCRIPT_DIR/.test-fixture"
TIMESTAMP="2099-01-01T00:00:00Z"
NEXT_STAGE="implement"

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

# --- Fixture factory ---
# Writes a status.yaml with three trap items whose evidence prose contains
# each of the three key strings.
write_fixture() {
    local out="$1"
    cat > "$out" <<'EOF'
initiative:
  id: "test-fixture"
  name: "sed-anchor regression fixture"
  status: "active"
  current_stage: "plan"
  created: "2026-04-17"
  updated: "2026-04-17T00:00:00Z"

stages:
  plan:
    status: "in_progress"
    entered: "2026-04-17T00:00:00Z"

items:
  trap-updated:
    name: "Trap item 1"
    status: "done"
    evidence: "Framework files updated: acu-eval/SKILL.md and others were changed"
  trap-current-stage:
    name: "Trap item 2"
    status: "done"
    evidence: "Regression note: after the transition, current_stage: implement was expected"
  trap-status-active:
    name: "Trap item 3"
    status: "done"
    evidence: 'The fixture top-level status: "active" value is tested here'

notes: "regression fixture"
EOF
}

# --- Grab the anchored sed lines from the fixed file ---
FIXED_ADVANCE="$(cd "$SCRIPT_DIR/../../gates" && pwd)/advance.sh"

assert_contains() {
    local label="$1" file="$2" needle="$3"
    if grep -qF -- "$needle" "$file"; then
        echo "  [PASS] $label"
        return 0
    else
        echo "  [FAIL] $label"
        echo "         expected to find: $needle"
        echo "         in file:          $file"
        return 1
    fi
}

assert_not_contains() {
    local label="$1" file="$2" needle="$3"
    if grep -qF -- "$needle" "$file"; then
        echo "  [FAIL] $label"
        echo "         did NOT expect to find: $needle"
        echo "         in file:                $file"
        return 1
    else
        echo "  [PASS] $label"
        return 0
    fi
}

FAILURES=0

# =====================================================
# HALF 1 — FIXED pattern preserves evidence prose
# =====================================================
echo ""
echo "=== HALF 1: Anchored pattern (the fix) ==="

FIXED_FIXTURE="$WORK_DIR/fixed-fixture.yaml"
write_fixture "$FIXED_FIXTURE"

sed -i "s/^  current_stage:.*/  current_stage: \"$NEXT_STAGE\"/" "$FIXED_FIXTURE"
sed -i "s/^  updated:.*/  updated: \"$TIMESTAMP\"/" "$FIXED_FIXTURE"
# status: "active" path is on the validate-complete branch; test it on a separate copy
FIXED_FIXTURE_STATUS="$WORK_DIR/fixed-fixture-status.yaml"
write_fixture "$FIXED_FIXTURE_STATUS"
sed -i 's/^  status: "active"/  status: "complete"/' "$FIXED_FIXTURE_STATUS"

echo ""
echo "Top-level fields updated correctly:"
assert_contains "current_stage top-level updated to 'implement'" \
    "$FIXED_FIXTURE" 'current_stage: "implement"' || FAILURES=$((FAILURES+1))
assert_contains "updated top-level updated to timestamp" \
    "$FIXED_FIXTURE" "updated: \"$TIMESTAMP\"" || FAILURES=$((FAILURES+1))
assert_contains "status top-level updated to 'complete'" \
    "$FIXED_FIXTURE_STATUS" 'status: "complete"' || FAILURES=$((FAILURES+1))

echo ""
echo "Evidence fields preserved (no mid-line corruption):"
assert_contains "trap-updated evidence intact" \
    "$FIXED_FIXTURE" "Framework files updated: acu-eval/SKILL.md and others were changed" \
    || FAILURES=$((FAILURES+1))
assert_contains "trap-current-stage evidence intact" \
    "$FIXED_FIXTURE" "after the transition, current_stage: implement was expected" \
    || FAILURES=$((FAILURES+1))
assert_contains "trap-status-active evidence intact (status: \"active\" preserved in prose)" \
    "$FIXED_FIXTURE_STATUS" 'top-level status: "active" value is tested here' \
    || FAILURES=$((FAILURES+1))

# =====================================================
# HALF 2 — UNFIXED pattern corrupts evidence (prove the bug was real)
# =====================================================
echo ""
echo "=== HALF 2: Unanchored pattern (the bug) ==="

UNFIXED_FIXTURE="$WORK_DIR/unfixed-fixture.yaml"
write_fixture "$UNFIXED_FIXTURE"

sed -i "s/current_stage:.*/current_stage: \"$NEXT_STAGE\"/" "$UNFIXED_FIXTURE"
sed -i "s/updated:.*/updated: \"$TIMESTAMP\"/" "$UNFIXED_FIXTURE"
UNFIXED_FIXTURE_STATUS="$WORK_DIR/unfixed-fixture-status.yaml"
write_fixture "$UNFIXED_FIXTURE_STATUS"
sed -i 's/status: "active"/status: "complete"/' "$UNFIXED_FIXTURE_STATUS"

echo ""
echo "Evidence fields CORRUPTED (confirming the bug was real):"
assert_not_contains "trap-updated evidence corrupted (not 'and others were changed')" \
    "$UNFIXED_FIXTURE" "and others were changed" \
    || FAILURES=$((FAILURES+1))
assert_not_contains "trap-current-stage evidence corrupted (not 'was expected')" \
    "$UNFIXED_FIXTURE" "was expected" \
    || FAILURES=$((FAILURES+1))
# For status: "active" there's no `.*` in the sed — it's a substring swap, not a tail-
# destroyer. The unfixed sed rewrites `status: "active"` -> `status: "complete"` mid-
# prose. So the evidence keeps its shape but its semantics silently flip.
assert_not_contains "trap-status-active evidence corrupted (no longer contains 'status: \"active\"')" \
    "$UNFIXED_FIXTURE_STATUS" 'top-level status: "active"' \
    || FAILURES=$((FAILURES+1))
assert_contains "trap-status-active evidence shows the corruption (swapped to 'status: \"complete\"')" \
    "$UNFIXED_FIXTURE_STATUS" 'top-level status: "complete"' \
    || FAILURES=$((FAILURES+1))

# =====================================================
# Summary
# =====================================================
echo ""
if [[ "$FAILURES" -eq 0 ]]; then
    echo "=== ALL ASSERTIONS PASSED ==="
    echo "The ^ anchor kills the evidence-corruption bug without breaking"
    echo "the intended top-level field updates. The pre-fix pattern reliably"
    echo "reproduces the bug (tautology ruled out)."
    exit 0
else
    echo "=== $FAILURES ASSERTION(S) FAILED ==="
    echo "See output above. Fixture files left in $WORK_DIR for inspection."
    exit 1
fi
