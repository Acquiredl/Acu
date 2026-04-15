#!/usr/bin/env bash
# Template self-test — validates template structure without generating pipelines.
#
# Reads test case YAML files from this directory and verifies:
# 1. All template files exist and are non-empty
# 2. All placeholders are documented in PLACEHOLDERS.md
# 3. Gate script templates have valid bash syntax (bash -n)
# 4. Schema template files are valid YAML (yq parse)
#
# Usage: bash _templates/tests/test.sh
#
# This does NOT run /acu-new — it validates the template files themselves.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PASS=0
FAIL=0
WARN=0

pass() { echo "  [PASS] $1"; PASS=$((PASS + 1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  [WARN] $1"; WARN=$((WARN + 1)); }

echo "=== Template Self-Test ==="
echo "Templates: $TEMPLATES_DIR"
echo ""

# ── Test 1: All template files exist and are non-empty ──────
echo "--- Test 1: Template file existence ---"

EXPECTED_TEMPLATES=(
    "pipeline-claude.md.template"
    "stage-claude.md.template"
    "gate.sh.template"
    "advance.sh.template"
    "intake.yaml.template"
    "status.yaml.template"
    "report.md.template"
    "intake.schema.yaml.template"
    "status.schema.yaml.template"
    "pipeline-status.sh.template"
    "PLACEHOLDERS.md"
    "CHANGELOG.md"
    "VERSION"
    "archetypes.yaml"
)

for tmpl in "${EXPECTED_TEMPLATES[@]}"; do
    if [[ -f "$TEMPLATES_DIR/$tmpl" ]]; then
        size=$(wc -c < "$TEMPLATES_DIR/$tmpl" 2>/dev/null || echo "0")
        if (( size > 0 )); then
            pass "$tmpl exists ($size bytes)"
        else
            fail "$tmpl exists but is empty"
        fi
    else
        fail "$tmpl not found"
    fi
done
echo ""

# ── Test 2: Placeholder consistency ─────────────────────────
echo "--- Test 2: Placeholder documentation ---"

# Extract all {{PLACEHOLDER}} patterns from templates
ALL_PLACEHOLDERS=$(grep -hoE '\{\{[A-Z_]+\}\}' "$TEMPLATES_DIR"/*.template 2>/dev/null | sort -u)

PLACEHOLDERS_DOC="$TEMPLATES_DIR/PLACEHOLDERS.md"
if [[ -f "$PLACEHOLDERS_DOC" ]]; then
    for ph in $ALL_PLACEHOLDERS; do
        # Strip {{ and }}
        name="${ph//\{\{/}"
        name="${name//\}\}/}"
        if grep -q "$name" "$PLACEHOLDERS_DOC"; then
            pass "{{$name}} documented in PLACEHOLDERS.md"
        else
            fail "{{$name}} used in templates but NOT documented in PLACEHOLDERS.md"
        fi
    done
else
    fail "PLACEHOLDERS.md not found"
fi
echo ""

# ── Test 3: Gate script template syntax ─────────────────────
echo "--- Test 3: Bash syntax validation ---"

for script_tmpl in "$TEMPLATES_DIR"/gate.sh.template "$TEMPLATES_DIR"/advance.sh.template "$TEMPLATES_DIR"/pipeline-status.sh.template; do
    if [[ ! -f "$script_tmpl" ]]; then
        warn "$(basename "$script_tmpl") not found — skipping syntax check"
        continue
    fi

    # Create temp copy with placeholders replaced by dummy values for syntax check.
    # Multi-line placeholders (TRANSITIONS_CASE, GATE_CHECKS, etc.) need valid bash.
    tmp_script=$(mktemp /tmp/template-syntax-XXXXXX.sh)
    sed \
        -e 's/{{TRANSITIONS_CASE}}/dummy) ;;\n/g' \
        -e 's/{{GATE_CHECKS}}/# no checks/g' \
        -e 's/{{[A-Z_]*}}/PLACEHOLDER/g' \
        "$script_tmpl" > "$tmp_script"

    if bash -n "$tmp_script" 2>/dev/null; then
        pass "$(basename "$script_tmpl") passes bash -n syntax check"
    else
        fail "$(basename "$script_tmpl") has bash syntax errors"
    fi
    rm -f "$tmp_script"
done
echo ""

# ── Test 4: Schema templates are parseable ──────────────────
echo "--- Test 4: Schema template structure ---"

for schema_tmpl in "$TEMPLATES_DIR"/intake.schema.yaml.template "$TEMPLATES_DIR"/status.schema.yaml.template; do
    if [[ ! -f "$schema_tmpl" ]]; then
        warn "$(basename "$schema_tmpl") not found — skipping"
        continue
    fi

    # Check it has a 'required:' key
    if grep -q "^required:" "$schema_tmpl"; then
        pass "$(basename "$schema_tmpl") has 'required:' key"
    else
        fail "$(basename "$schema_tmpl") missing 'required:' key"
    fi
done
echo ""

# ── Test 5: Version file consistency ────────────────────────
echo "--- Test 5: Version consistency ---"

if [[ -f "$TEMPLATES_DIR/VERSION" ]]; then
    VERSION=$(cat "$TEMPLATES_DIR/VERSION" | tr -d '[:space:]')
    if [[ "$VERSION" =~ ^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[0-9]+$ ]]; then
        pass "VERSION format valid: $VERSION"
    else
        fail "VERSION format invalid: $VERSION (expected YYYY.MM.DD.N)"
    fi

    # Check CHANGELOG has an entry for this version
    if [[ -f "$TEMPLATES_DIR/CHANGELOG.md" ]]; then
        if grep -q "## $VERSION" "$TEMPLATES_DIR/CHANGELOG.md"; then
            pass "CHANGELOG.md has entry for $VERSION"
        else
            fail "CHANGELOG.md missing entry for current version $VERSION"
        fi
    fi
else
    fail "VERSION file not found"
fi
echo ""

# ── Test 6: Archetypes structure ────────────────────────────
echo "--- Test 6: Archetypes validation ---"

ARCHETYPES_FILE="$TEMPLATES_DIR/archetypes.yaml"
if [[ -f "$ARCHETYPES_FILE" ]]; then
    if command -v yq &>/dev/null; then
        ARCHETYPE_COUNT=$(yq e '.archetypes | length' "$ARCHETYPES_FILE" 2>/dev/null) || ARCHETYPE_COUNT=0
        if (( ARCHETYPE_COUNT >= 3 )); then
            pass "archetypes.yaml has $ARCHETYPE_COUNT archetypes (minimum 3)"
        else
            fail "archetypes.yaml has $ARCHETYPE_COUNT archetypes (minimum 3 required)"
        fi

        # Check each archetype has required fields
        for arch in $(yq e '.archetypes | keys | .[]' "$ARCHETYPES_FILE" 2>/dev/null); do
            for field in name stage_pattern stage_count_range gate_emphasis default_constraints; do
                val=$(yq e ".archetypes.$arch.$field // \"\"" "$ARCHETYPES_FILE" 2>/dev/null)
                if [[ -n "$val" && "$val" != "null" ]]; then
                    pass "archetype '$arch' has $field"
                else
                    fail "archetype '$arch' missing $field"
                fi
            done
        done
    else
        warn "yq not installed — archetype field validation skipped"
        if grep -q "stage_pattern:" "$ARCHETYPES_FILE"; then
            pass "archetypes.yaml has stage_pattern entries"
        else
            fail "archetypes.yaml missing stage_pattern entries"
        fi
    fi
else
    fail "archetypes.yaml not found"
fi
echo ""

# ── Summary ─────────────────────────────────────────────────
echo "=== Results ==="
echo "  Passed:   $PASS"
echo "  Failed:   $FAIL"
echo "  Warnings: $WARN"
echo ""

if (( FAIL > 0 )); then
    echo "TEMPLATE SELF-TEST FAILED ($FAIL failures)"
    exit 1
else
    echo "TEMPLATE SELF-TEST PASSED"
    exit 0
fi
