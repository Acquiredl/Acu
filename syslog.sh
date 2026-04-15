#!/usr/bin/env bash
# syslog.sh — Aggregate audit logs across all pipelines.
# Read-only. Walks all work unit audit logs and produces a unified view.
#
# Usage:
#   syslog.sh              Show all entries, most recent last
#   syslog.sh --last N     Show only the last N entries
#   syslog.sh --fails      Show only FAIL entries
#
# Output: timestamp | pipeline | unit | gate | result

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINES_DIR="$SCRIPT_DIR/pipelines"

LAST=""
FILTER=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --last)  LAST="$2"; shift 2 ;;
        --fails) FILTER="FAIL"; shift ;;
        *)       echo "Unknown option: $1"; exit 1 ;;
    esac
done

if [[ ! -d "$PIPELINES_DIR" ]]; then
    echo "No pipelines/ directory found"
    exit 0
fi

# Collect all audit log entries with pipeline and unit context
collect_entries() {
    for pipeline_dir in "$PIPELINES_DIR"/*/; do
        [[ -d "$pipeline_dir" ]] || continue
        pipeline_name=$(basename "$pipeline_dir")
        [[ "$pipeline_name" == "_graveyard" ]] && continue

        # Find all .audit-log.jsonl files in any subdirectory
        find "$pipeline_dir" -name ".audit-log.jsonl" -type f 2>/dev/null | while IFS= read -r log_file; do
            # Extract unit name from parent directory
            unit_name=$(basename "$(dirname "$log_file")")
            while IFS= read -r line; do
                [[ -z "$line" ]] && continue
                ts=$(echo "$line" | sed -n 's/.*"ts":"\([^"]*\)".*/\1/p')
                gate=$(echo "$line" | sed -n 's/.*"gate":"\([^"]*\)".*/\1/p')
                result=$(echo "$line" | sed -n 's/.*"result":"\([^"]*\)".*/\1/p')
                [[ -z "$ts" ]] && continue
                printf "%s\t%-15s\t%-25s\t%-25s\t%s\n" "$ts" "$pipeline_name" "$unit_name" "$gate" "$result"
            done < "$log_file"
        done
    done
}

# Header
printf "%-22s\t%-15s\t%-25s\t%-25s\t%s\n" "Timestamp" "Pipeline" "Unit" "Gate" "Result"
printf "%-22s\t%-15s\t%-25s\t%-25s\t%s\n" "----------------------" "---------------" "-------------------------" "-------------------------" "------"

# Collect, sort by timestamp, apply filters
OUTPUT=$(collect_entries | sort -t$'\t' -k1)

if [[ -n "$FILTER" ]]; then
    OUTPUT=$(echo "$OUTPUT" | grep "$FILTER" || true)
fi

if [[ -n "$LAST" ]]; then
    echo "$OUTPUT" | tail -n "$LAST"
else
    echo "$OUTPUT"
fi

# Summary
TOTAL=$(echo "$OUTPUT" | grep -c . || true)
PASSES=$(echo "$OUTPUT" | grep -c "PASS" || true)
FAILS=$(echo "$OUTPUT" | grep -c "FAIL" || true)

echo ""
echo "--- $TOTAL entries | $PASSES passed | $FAILS failed ---"
