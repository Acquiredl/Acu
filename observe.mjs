#!/usr/bin/env node
/**
 * observe.mjs — Acu single-pane framework observation.
 * Aggregates 6 data streams into a 5-section report.
 * Read-only except for the observe audit trail.
 *
 * Usage:
 *   node observe.mjs                   Full report (all 5 sections)
 *   node observe.mjs --quick           One-line-per-section summary
 *   node observe.mjs --section health  Drill into one section
 *   node observe.mjs --json            Machine-readable JSON output
 */

import { readFileSync, readdirSync, existsSync, statSync, appendFileSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PIPELINES_DIR = join(__dirname, 'pipelines');
const TEMPLATES_DIR = join(__dirname, '_templates');
const ROADMAP_DIR = join(__dirname, '_roadmap');
const REVIEW_LOG = join(__dirname, 'REVIEW-LOG.md');
const OBSERVE_LOG = join(ROADMAP_DIR, '.observe-log.jsonl');

// ── Helpers ────────────────────────────────────────────────

function pad(s, n) { return s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length); }

function readFile(path) {
  try { return readFileSync(path, 'utf-8'); } catch { return ''; }
}

function parseYamlField(content, field) {
  const m = content.match(new RegExp(`^\\s*${field}:\\s*"?([^"\\n]+)"?`, 'm'));
  return m ? m[1].trim() : '';
}

function parseYamlFieldNested(content, parent, field) {
  const parentIdx = content.indexOf(`${parent}:`);
  if (parentIdx === -1) return '';
  const sub = content.slice(parentIdx);
  const m = sub.match(new RegExp(`^\\s+${field}:\\s*"?([^"\\n]+)"?`, 'm'));
  return m ? m[1].trim() : '';
}

// ── Section 1: Framework Health ────────────────────────────

function collectHealth() {
  // Template version
  const currentVersion = readFile(join(TEMPLATES_DIR, 'VERSION')).trim();

  // Template tests — run test.sh, parse results
  let testPass = 0, testFail = 0, testWarn = 0;
  try {
    const out = execSync('bash _templates/tests/test.sh 2>&1', {
      cwd: __dirname, encoding: 'utf-8', timeout: 30000,
    });
    const passM = out.match(/Passed:\s+(\d+)/);
    const failM = out.match(/Failed:\s+(\d+)/);
    const warnM = out.match(/Warnings:\s+(\d+)/);
    if (passM) testPass = parseInt(passM[1]);
    if (failM) testFail = parseInt(failM[1]);
    if (warnM) testWarn = parseInt(warnM[1]);
  } catch (e) {
    // test.sh exits non-zero on failures — still parse stdout
    const out = e.stdout || '';
    const passM = out.match(/Passed:\s+(\d+)/);
    const failM = out.match(/Failed:\s+(\d+)/);
    const warnM = out.match(/Warnings:\s+(\d+)/);
    if (passM) testPass = parseInt(passM[1]);
    if (failM) testFail = parseInt(failM[1]);
    if (warnM) testWarn = parseInt(warnM[1]);
  }

  // Pipeline version drift
  const drift = { current: 0, outdated: 0, preVersioning: 0, details: [] };
  if (existsSync(PIPELINES_DIR)) {
    for (const name of readdirSync(PIPELINES_DIR)) {
      if (name === '_graveyard' || name.startsWith('.')) continue;
      const pdir = join(PIPELINES_DIR, name);
      if (!statSync(pdir).isDirectory()) continue;
      const metaPath = join(pdir, '.acu-meta.yaml');
      if (!existsSync(metaPath)) {
        drift.preVersioning++;
        drift.details.push({ pipeline: name, version: null, status: 'pre-versioning' });
        continue;
      }
      const meta = readFile(metaPath);
      const tv = parseYamlField(meta, 'template_version');
      if (tv === currentVersion) {
        drift.current++;
        drift.details.push({ pipeline: name, version: tv, status: 'current' });
      } else {
        drift.outdated++;
        drift.details.push({ pipeline: name, version: tv || '?', status: 'outdated' });
      }
    }
  }

  // Structural compliance — check for gates/ and advance.sh
  const compliance = [];
  if (existsSync(PIPELINES_DIR)) {
    for (const name of readdirSync(PIPELINES_DIR)) {
      if (name === '_graveyard' || name.startsWith('.')) continue;
      const pdir = join(PIPELINES_DIR, name);
      if (!statSync(pdir).isDirectory()) continue;
      const issues = [];
      if (!existsSync(join(pdir, 'gates'))) issues.push('missing gates/');
      if (!existsSync(join(pdir, 'gates', 'advance.sh'))) issues.push('missing advance.sh');
      if (issues.length > 0) compliance.push({ pipeline: name, issues });
    }
  }

  return { currentVersion, testPass, testFail, testWarn, drift, compliance };
}

// ── Section 2: Pipeline Status ─────────────────────────────

function collectPipelineStatus() {
  const pipelines = [];
  if (!existsSync(PIPELINES_DIR)) return { pipelines, totals: { units: 0, complete: 0, active: 0, blocked: 0 }, stalls: [] };

  for (const name of readdirSync(PIPELINES_DIR)) {
    if (name === '_graveyard' || name.startsWith('.')) continue;
    const pdir = join(PIPELINES_DIR, name);
    if (!statSync(pdir).isDirectory()) continue;

    const units = findStatusFiles(pdir);
    const active = units.filter(u => u.status === 'active' || u.status === 'in_progress');
    const complete = units.filter(u => u.status === 'complete');
    const blocked = units.filter(u => u.status === 'paused' || u.status === 'blocked');

    // Most recent unit's current stage
    let recentStage = '';
    if (units.length > 0) {
      const sorted = units.filter(u => u.updated).sort((a, b) =>
        new Date(b.updated) - new Date(a.updated)
      );
      if (sorted.length > 0) recentStage = sorted[0].currentStage || '';
    }

    pipelines.push({
      name,
      unitCount: units.length,
      active: active.length,
      complete: complete.length,
      blocked: blocked.length,
      completionRate: units.length > 0 ? (complete.length / units.length * 100).toFixed(0) : 'N/A',
      recentStage,
    });
  }

  const totals = {
    units: pipelines.reduce((s, p) => s + p.unitCount, 0),
    complete: pipelines.reduce((s, p) => s + p.complete, 0),
    active: pipelines.reduce((s, p) => s + p.active, 0),
    blocked: pipelines.reduce((s, p) => s + p.blocked, 0),
  };

  // Stall detection
  const stalls = detectStalls();

  return { pipelines, totals, stalls };
}

function findStatusFiles(pdir) {
  const units = [];
  walkForStatus(pdir, units, 0);
  return units;
}

function walkForStatus(dir, units, depth) {
  if (depth > 4) return;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      const statusPath = join(full, 'status.yaml');
      if (existsSync(statusPath)) {
        const content = readFile(statusPath);
        // Skip pipeline-level status files (look for "unit:" or direct status in first indent)
        const hasUnit = content.includes('unit:') || content.includes('component:') || content.includes('engagement:');
        const status = parseYamlField(content, 'status');
        const updated = parseYamlField(content, 'updated');
        const currentStage = parseYamlField(content, 'current_stage');
        units.push({ name: entry.name, status, updated, currentStage });
      } else {
        walkForStatus(full, units, depth + 1);
      }
    }
  } catch { /* permission or read error */ }
}

function detectStalls() {
  const stalls = [];
  const now = Date.now();
  const threshold = 14 * 86400000;

  if (!existsSync(PIPELINES_DIR)) return stalls;

  for (const pipeline of readdirSync(PIPELINES_DIR)) {
    if (pipeline === '_graveyard' || pipeline.startsWith('.')) continue;
    const pdir = join(PIPELINES_DIR, pipeline);
    if (!statSync(pdir).isDirectory()) continue;
    walkForStalls(pdir, pipeline, stalls, now, threshold, 0);
  }
  return stalls;
}

function walkForStalls(dir, pipeline, stalls, now, threshold, depth) {
  if (depth > 4) return;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const full = join(dir, entry.name);
      const statusPath = join(full, 'status.yaml');
      if (existsSync(statusPath)) {
        const content = readFile(statusPath);
        const status = parseYamlField(content, 'status');
        if (status === 'complete') continue;
        const updated = parseYamlField(content, 'updated');
        if (updated) {
          const days = (now - new Date(updated).getTime()) / 86400000;
          if (days >= 14) {
            stalls.push({
              pipeline, unit: entry.name,
              lastUpdated: updated.slice(0, 10),
              days: Math.round(days),
            });
          }
        }
      } else {
        walkForStalls(full, pipeline, stalls, now, threshold, depth + 1);
      }
    }
  } catch { /* skip */ }
}

// ── Section 3: Gate Performance ────────────────────────────

function collectGatePerformance() {
  try {
    const out = execSync('node pulse.mjs --json', {
      cwd: __dirname, encoding: 'utf-8', timeout: 30000,
    });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

// ── Section 4: Review Cycle ────────────────────────────────

function collectReviewCycle() {
  const content = readFile(REVIEW_LOG);
  if (!content) return { lastReviewDate: null, suggestions: 0, proposals: 0, observations: 0 };

  // Last review date — match ### [YYYY-MM-DD]
  const dates = [...content.matchAll(/### \[(\d{4}-\d{2}-\d{2})\]/g)].map(m => m[1]);
  const lastReviewDate = dates.length > 0 ? dates[dates.length - 1] : null;

  // Suggestions — match #### Suggestion
  const suggestions = (content.match(/#### Suggestion/g) || []).length;

  // Proposals — match [PROPOSAL]
  const proposals = (content.match(/\[PROPOSAL\]/g) || []).length;

  // One-off observations — match **O\d+
  const observations = (content.match(/\*\*O\d+/g) || []).length;

  return { lastReviewDate, suggestions, proposals, observations };
}

// ── Section 5: Roadmap ─────────────────────────────────────

function collectRoadmap() {
  const initiatives = { active: [], completed: [] };
  const initDir = join(ROADMAP_DIR, 'initiatives');

  if (!existsSync(initDir)) return initiatives;

  for (const name of readdirSync(initDir)) {
    const idir = join(initDir, name);
    if (!statSync(idir).isDirectory()) continue;
    const statusContent = readFile(join(idir, 'status.yaml'));
    if (!statusContent) continue;

    const initName = parseYamlField(statusContent, 'name') || name;
    const status = parseYamlField(statusContent, 'status');
    const currentStage = parseYamlField(statusContent, 'current_stage');

    // Count items
    const itemsSection = statusContent.split(/^items:/m)[1] || '';
    const itemLines = itemsSection.match(/^\s{2}\S.*:/gm) || [];
    let done = 0, total = 0, deferred = 0;
    const deferredItems = [];

    for (const line of itemLines) {
      const itemId = line.trim().replace(/:$/, '');
      // Extract this item's block
      const itemBlock = extractItemBlock(statusContent, itemId);
      total++;
      const itemStatus = parseYamlField(itemBlock, 'status');
      if (itemStatus === 'complete' || itemStatus === 'done') done++;
      if (itemStatus === 'deferred') {
        deferred++;
        const reason = parseYamlField(itemBlock, 'deferred_reason');
        deferredItems.push({ id: itemId, reason: reason || '(no reason)' });
      }
    }

    const entry = { name: initName, id: name, stage: currentStage, done, total, deferred, deferredItems };
    if (status === 'complete') {
      initiatives.completed.push(entry);
    } else {
      initiatives.active.push(entry);
    }
  }

  return initiatives;
}

function extractItemBlock(content, itemId) {
  const regex = new RegExp(`^  ${itemId}:`, 'm');
  const match = content.match(regex);
  if (!match) return '';
  const start = match.index;
  const rest = content.slice(start);
  // Find next item or end of items block
  const end = rest.match(/\n  \S.*:|^\S/m);
  return end ? rest.slice(0, end.index) : rest;
}

// ── Output Formatters ──────────────────────────────────────

function printFull(health, pStatus, gates, review, roadmap) {
  const now = new Date().toISOString().slice(0, 10);
  console.log('ACU OBSERVE — Framework Status');
  console.log(`Scan date: ${now}`);
  console.log();

  printHealthSection(health);
  printPipelineSection(pStatus);
  printGateSection(gates);
  printReviewSection(review);
  printRoadmapSection(roadmap);
}

function printHealthSection(h) {
  console.log('='.repeat(60));
  console.log('1. FRAMEWORK HEALTH');
  console.log('='.repeat(60));
  const testStatus = h.testFail > 0 ? 'FAIL' : 'PASS';
  console.log(`Template version: ${h.currentVersion}`);
  console.log(`Template tests:   ${testStatus} (${h.testPass} pass, ${h.testFail} fail, ${h.testWarn} warn)`);
  console.log(`Pipeline drift:   ${h.drift.current} current, ${h.drift.outdated} outdated, ${h.drift.preVersioning} pre-versioning`);
  if (h.drift.outdated > 0) {
    for (const d of h.drift.details.filter(d => d.status === 'outdated')) {
      console.log(`  [DRIFT] ${d.pipeline}: ${d.version} (current: ${h.currentVersion})`);
    }
  }
  if (h.compliance.length > 0) {
    for (const c of h.compliance) {
      console.log(`  [COMPLIANCE] ${c.pipeline}: ${c.issues.join(', ')}`);
    }
  }
  console.log();
}

function printPipelineSection(ps) {
  console.log('='.repeat(60));
  console.log('2. PIPELINE STATUS');
  console.log('='.repeat(60));
  console.log(pad('Pipeline', 18) + pad('Units', 7) + pad('Done', 6) + pad('Active', 8) + pad('Blocked', 9) + 'Recent Stage');
  console.log('-'.repeat(60));
  for (const p of ps.pipelines) {
    console.log(
      pad(p.name, 18) + pad(String(p.unitCount), 7) +
      pad(String(p.complete), 6) + pad(String(p.active), 8) +
      pad(String(p.blocked), 9) + (p.recentStage || '-')
    );
  }
  console.log();
  console.log(`Totals: ${ps.totals.units} units, ${ps.totals.complete} complete, ${ps.totals.active} active, ${ps.totals.blocked} blocked`);
  if (ps.stalls.length > 0) {
    console.log();
    for (const s of ps.stalls) {
      console.log(`  [STALL] ${s.pipeline}/${s.unit} — last updated ${s.lastUpdated} (${s.days} days ago)`);
    }
  }
  console.log();
}

function printGateSection(pulse) {
  console.log('='.repeat(60));
  console.log('3. GATE PERFORMANCE');
  console.log('='.repeat(60));

  if (!pulse) {
    console.log('(pulse data unavailable)');
    console.log();
    return;
  }

  const a = pulse.autonomy;
  console.log(`Autonomy — structural: ${a.structural.rate != null ? a.structural.rate + '%' : 'N/A'}, full-stack: ${a.full_stack.rate != null ? a.full_stack.rate + '%' : 'N/A'} (${a.eligible} eligible)`);

  // Top 5 lowest first-pass rates
  const fpr = pulse.gate_analytics?.first_pass_rates || {};
  const sorted = Object.entries(fpr)
    .map(([gate, r]) => ({ gate, rate: r.total > 0 ? r.firstPass / r.total : 1, ...r }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 5);

  if (sorted.length > 0) {
    console.log();
    console.log('Bottom 5 first-pass rates:');
    for (const g of sorted) {
      console.log(`  ${pad(g.gate, 28)} ${(g.rate * 100).toFixed(0)}% (${g.firstPass}/${g.total})`);
    }
  }

  // Failure ratio
  const failureCauses = pulse.gate_analytics?.failure_causes;
  if (failureCauses && failureCauses.length > 0) {
    console.log();
    console.log(`Top failure cause: ${failureCauses[0].desc} (${failureCauses[0].count}x across ${failureCauses[0].pipelines?.length || 1} pipeline(s))`);
  }

  // Alerts by type
  const alerts = pulse.alerts || [];
  const byType = {};
  for (const a of alerts) {
    const type = a.match(/^\[([^\]]+)\]/)?.[1] || 'OTHER';
    byType[type] = (byType[type] || 0) + 1;
  }
  const alertCount = alerts.length;
  if (alertCount > 0) {
    const parts = Object.entries(byType).map(([t, c]) => `${c} ${t.toLowerCase()}`).join(', ');
    console.log(`Alerts: ${alertCount} (${parts})`);
  } else {
    console.log('Alerts: 0');
  }

  // Top structural failure causes
  const causes = pulse.gate_analytics?.failure_causes || [];
  if (causes.length > 0) {
    console.log();
    console.log('Top structural failure causes:');
    for (const c of causes.slice(0, 5)) {
      const pCount = c.pipelines.length === 1 ? '1 pipeline' : `${c.pipelines.length} pipelines`;
      console.log(`  ${String(c.count).padStart(3)}x  ${c.gate.padEnd(28)} ${c.desc} (${pCount})`);
    }
  }
  console.log();
}

function printReviewSection(r) {
  console.log('='.repeat(60));
  console.log('4. REVIEW CYCLE');
  console.log('='.repeat(60));
  console.log(`Last review:       ${r.lastReviewDate || 'never'}`);
  console.log(`Open suggestions:  ${r.suggestions}`);
  console.log(`Open proposals:    ${r.proposals}`);
  console.log(`Observations:      ${r.observations}`);
  console.log();
}

function printRoadmapSection(rm) {
  console.log('='.repeat(60));
  console.log('5. ROADMAP');
  console.log('='.repeat(60));

  if (rm.active.length > 0) {
    console.log('Active:');
    for (const i of rm.active) {
      console.log(`  ${i.name} — ${i.done}/${i.total} items done, stage: ${i.stage || '?'}`);
      if (i.deferred > 0) {
        for (const d of i.deferredItems) {
          console.log(`    [DEFERRED] ${d.id}: ${d.reason}`);
        }
      }
    }
  } else {
    console.log('Active: (none)');
  }

  if (rm.completed.length > 0) {
    console.log('Completed:');
    for (const i of rm.completed) {
      console.log(`  ${i.name} — ${i.done}/${i.total} items${i.deferred > 0 ? `, ${i.deferred} deferred` : ''}`);
    }
  }
  console.log();
}

// ── Quick Mode ─────────────────────────────────────────────

function printQuick(health, pStatus, gates, review, roadmap) {
  const testTag = health.testFail > 0 ? `FAIL(${health.testFail})` : 'PASS';
  const driftTag = health.drift.outdated > 0 ? `${health.drift.outdated} outdated` : 'all current';
  console.log(`Health:    ${testTag}, ${driftTag}, v${health.currentVersion}`);

  console.log(`Pipelines: ${pStatus.totals.units} units, ${pStatus.totals.complete} done, ${pStatus.totals.active} active, ${pStatus.stalls.length} stalls`);

  if (gates) {
    const a = gates.autonomy;
    const alertCount = (gates.alerts || []).length;
    console.log(`Gates:     structural ${a.structural.rate ?? 'N/A'}%, full-stack ${a.full_stack.rate ?? 'N/A'}%, ${alertCount} alerts`);
  } else {
    console.log('Gates:     (pulse unavailable)');
  }

  console.log(`Review:    last ${review.lastReviewDate || 'never'}, ${review.suggestions} suggestions, ${review.proposals} proposals`);

  const activeInit = roadmap.active.map(i => `${i.name}(${i.done}/${i.total})`).join(', ') || 'none';
  console.log(`Roadmap:   ${roadmap.active.length} active [${activeInit}], ${roadmap.completed.length} completed`);
}

// ── Section Drill-Down ─────────────────────────────────────

function printSection(name, health, pStatus, gates, review, roadmap) {
  switch (name) {
    case 'health':    printHealthSection(health); break;
    case 'pipelines': printPipelineSection(pStatus); break;
    case 'gates':     printGateSection(gates); break;
    case 'review':    printReviewSection(review); break;
    case 'roadmap':   printRoadmapSection(roadmap); break;
    default:
      console.error(`Unknown section: ${name}`);
      console.error('Valid sections: health, pipelines, gates, review, roadmap');
      process.exit(1);
  }
}

// ── JSON Output ────────────────────────────────────────────

function printJSON(health, pStatus, gates, review, roadmap) {
  console.log(JSON.stringify({
    scan_date: new Date().toISOString(),
    health: {
      template_version: health.currentVersion,
      tests: { pass: health.testPass, fail: health.testFail, warn: health.testWarn },
      drift: {
        current: health.drift.current,
        outdated: health.drift.outdated,
        pre_versioning: health.drift.preVersioning,
        details: health.drift.details,
      },
      compliance: health.compliance,
    },
    pipelines: {
      list: pStatus.pipelines,
      totals: pStatus.totals,
      stalls: pStatus.stalls,
    },
    gates: gates ? {
      autonomy: gates.autonomy,
      first_pass_rates: gates.gate_analytics?.first_pass_rates || {},
      failure_ratio: gates.gate_analytics?.failure_ratio || {},
      failure_causes: gates.gate_analytics?.failure_causes || [],
      alerts: gates.alerts || [],
      alert_count: (gates.alerts || []).length,
    } : null,
    review,
    roadmap,
  }, null, 2));
}

// ── Audit Trail (OB-5) ────────────────────────────────────

function writeAuditEntry(mode, health, pStatus, gates, review, roadmap) {
  const entry = {
    ts: new Date().toISOString(),
    mode,
    autonomy_structural: gates?.autonomy?.structural?.rate ?? null,
    autonomy_fullstack: gates?.autonomy?.full_stack?.rate ?? null,
    alerts: (gates?.alerts || []).length,
    stalls: pStatus.stalls.length,
    active_units: pStatus.totals.active,
    open_proposals: review.proposals,
  };
  try {
    mkdirSync(join(ROADMAP_DIR), { recursive: true });
    appendFileSync(OBSERVE_LOG, JSON.stringify(entry) + '\n');
  } catch { /* best-effort */ }
}

// ── Entry Point ────────────────────────────────────────────

const args = process.argv.slice(2);
const isQuick = args.includes('--quick');
const isJSON = args.includes('--json');
const sectionIdx = args.indexOf('--section');
const sectionName = sectionIdx >= 0 ? args[sectionIdx + 1] : null;

// Determine mode label
let mode = 'full';
if (isQuick) mode = 'quick';
else if (isJSON) mode = 'json';
else if (sectionName) mode = `section:${sectionName}`;

// Collect all data
const health = collectHealth();
const pStatus = collectPipelineStatus();
const gates = collectGatePerformance();
const review = collectReviewCycle();
const roadmap = collectRoadmap();

// Output
if (isJSON) {
  printJSON(health, pStatus, gates, review, roadmap);
} else if (isQuick) {
  printQuick(health, pStatus, gates, review, roadmap);
} else if (sectionName) {
  printSection(sectionName, health, pStatus, gates, review, roadmap);
} else {
  printFull(health, pStatus, gates, review, roadmap);
}

// Audit trail
writeAuditEntry(mode, health, pStatus, gates, review, roadmap);
