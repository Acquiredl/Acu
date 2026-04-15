#!/usr/bin/env node
/**
 * pulse.mjs — Acu pipeline health metrics.
 * Read-only. Computes autonomy rate, gate pass rates, cycle times,
 * and pattern alerts from audit logs and status files.
 *
 * Usage:
 *   node pulse.mjs              Full report
 *   node pulse.mjs --json       Machine-readable JSON output
 *   node pulse.mjs --alerts     Alerts only
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PIPELINES_DIR = join(__dirname, 'pipelines');

// ── Data Collection ─────────────────────────────────────────

function findUnits() {
  const units = [];
  if (!existsSync(PIPELINES_DIR)) return units;

  for (const pipeline of readdirSync(PIPELINES_DIR)) {
    if (pipeline === '_graveyard' || pipeline.startsWith('.')) continue;
    const pipelineDir = join(PIPELINES_DIR, pipeline);
    if (!statSync(pipelineDir).isDirectory()) continue;
    walkForUnits(pipelineDir, pipeline, units);
  }
  return units;
}

function walkForUnits(dir, pipeline, units) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (!entry.isDirectory()) continue;

    const auditPath = join(fullPath, '.audit-log.jsonl');
    if (existsSync(auditPath)) {
      units.push({
        pipeline,
        unit: entry.name,
        unitDir: fullPath,
        entries: readAuditLog(auditPath),
        status: readStatus(join(fullPath, 'status.yaml')),
      });
    } else {
      walkForUnits(fullPath, pipeline, units);
    }
  }
}

function readAuditLog(path) {
  return readFileSync(path, 'utf-8')
    .split('\n')
    .filter(l => l.trim())
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

function readStatus(path) {
  if (!existsSync(path)) return null;
  const content = readFileSync(path, 'utf-8');

  // Unit-level status (first status: field at 2-space indent)
  const statusMatch = content.match(/^  status:\s*"([^"]+)"/m);
  const unitStatus = statusMatch ? statusMatch[1] : 'unknown';

  // Stage cycle times
  const stages = {};
  let inStages = false;
  let currentStage = null;

  for (const line of content.split('\n')) {
    if (/^stages:\s*$/.test(line)) { inStages = true; continue; }
    if (inStages) {
      if (/^\S/.test(line)) { inStages = false; continue; }
      const sm = line.match(/^  (\w[\w-]*):\s*$/);
      if (sm) { currentStage = sm[1]; stages[currentStage] = {}; continue; }
      if (currentStage) {
        const em = line.match(/^\s+entered:\s*"([^"]+)"/);
        const cm = line.match(/^\s+completed:\s*"([^"]+)"/);
        if (em) stages[currentStage].entered = em[1];
        if (cm) stages[currentStage].completed = cm[1];
      }
    }
  }

  return { unitStatus, stages };
}

// ── Classification ──────────────────────────────────────────

function classifyUnit(unit) {
  const { entries } = unit;
  const structural = entries.filter(e => !e.layer);

  const structFails  = structural.filter(e => e.result === 'FAIL').length;
  const structPasses = structural.filter(e => e.result === 'PASS').length;

  // Priority: BLOCKED > TROUBLED > NEAR-CLEAN > CLEAN
  let classification;
  const lastByGate = {};
  for (const e of structural) lastByGate[e.gate] = e.result;
  const blocked = Object.values(lastByGate).some(r => r === 'FAIL');

  if (blocked) {
    classification = 'BLOCKED';
  } else if (structFails >= 2) {
    classification = 'TROUBLED';
  } else if (structFails === 1) {
    classification = 'NEAR-CLEAN';
  } else {
    classification = 'CLEAN';
  }

  return {
    ...unit,
    classification,
    stats: {
      structPasses, structFails,
      totalEntries: entries.length,
    },
  };
}

// ── Aggregation ─────────────────────────────────────────────

function aggregateGates(units) {
  const gates = {};
  for (const u of units) {
    for (const e of u.entries.filter(e => !e.layer)) {
      if (!gates[e.gate]) gates[e.gate] = { pass: 0, fail: 0 };
      if (e.result === 'PASS') gates[e.gate].pass++;
      else if (e.result === 'FAIL') gates[e.gate].fail++;
    }
  }
  return gates;
}

function computeCycleTimes(units) {
  const times = [];
  for (const u of units) {
    if (!u.status?.stages) continue;
    for (const [stage, t] of Object.entries(u.status.stages)) {
      if (t.entered && t.completed) {
        const ms = new Date(t.completed) - new Date(t.entered);
        if (ms > 0) times.push({ pipeline: u.pipeline, unit: u.unit, stage, ms });
      }
    }
  }
  return times;
}

function formatDuration(ms) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function pad(s, n) { return s.length >= n ? s + ' ' : s + ' '.repeat(n - s.length); }

// ── Gate Analytics ─────────────────────────────────────────

function computeFirstPassRates(units) {
  const rates = {};
  for (const u of units) {
    const seenGates = {};
    for (const e of u.entries) {
      if (e.layer) continue;
      if (!seenGates[e.gate]) {
        seenGates[e.gate] = true;
        if (!rates[e.gate]) rates[e.gate] = { firstPass: 0, total: 0 };
        rates[e.gate].total++;
        if (e.result === 'PASS') rates[e.gate].firstPass++;
      }
    }
  }
  return rates;
}

function computeRetryTimes(units) {
  const retries = [];
  for (const u of units) {
    const byGate = {};
    for (const e of u.entries) {
      if (e.layer) continue;
      if (!byGate[e.gate]) byGate[e.gate] = [];
      byGate[e.gate].push(e);
    }
    for (const [gate, entries] of Object.entries(byGate)) {
      for (let i = 0; i < entries.length - 1; i++) {
        if (entries[i].result === 'FAIL') {
          const ms = new Date(entries[i + 1].ts) - new Date(entries[i].ts);
          if (ms > 0) retries.push({ pipeline: u.pipeline, unit: u.unit, gate, ms });
        }
      }
    }
  }
  return retries;
}

function aggregateFailureCauses(units) {
  const causes = {};
  for (const u of units) {
    for (const e of u.entries) {
      if (e.layer !== 'structural-checks' || !e.checks) continue;
      for (const c of e.checks) {
        if (c.result !== 'FAIL') continue;
        const key = `${e.gate}||${c.desc}`;
        if (!causes[key]) causes[key] = { gate: e.gate, desc: c.desc, count: 0, pipelines: new Set() };
        causes[key].count++;
        causes[key].pipelines.add(u.pipeline);
      }
    }
  }
  return Object.values(causes)
    .map(c => ({ ...c, pipelines: [...c.pipelines] }))
    .sort((a, b) => b.count - a.count);
}

// ── Pipeline Metrics ──────────────────────────────────────

function computeCompletionRates(units) {
  const byPipeline = {};
  for (const u of units) {
    if (!byPipeline[u.pipeline]) byPipeline[u.pipeline] = { total: 0, complete: 0 };
    byPipeline[u.pipeline].total++;
    if (u.status?.unitStatus === 'complete') byPipeline[u.pipeline].complete++;
  }
  return byPipeline;
}

function computeStageVelocity(cycleTimes) {
  const byStage = {};
  for (const t of cycleTimes) {
    if (!byStage[t.stage]) byStage[t.stage] = [];
    byStage[t.stage].push(t.ms);
  }
  const result = {};
  for (const [stage, times] of Object.entries(byStage)) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    result[stage] = { avg, min: Math.min(...times), max: Math.max(...times), count: times.length };
  }
  return result;
}

function detectStalls(units, thresholdDays = 14) {
  const now = Date.now();
  const stalls = [];
  for (const u of units) {
    if (u.status?.unitStatus === 'complete') continue;
    let lastActivity = 0;
    for (const e of u.entries) {
      const ts = new Date(e.ts).getTime();
      if (ts > lastActivity) lastActivity = ts;
    }
    if (u.status?.stages) {
      for (const t of Object.values(u.status.stages)) {
        for (const key of ['entered', 'completed']) {
          if (t[key]) {
            const ts = new Date(t[key]).getTime();
            if (ts > lastActivity) lastActivity = ts;
          }
        }
      }
    }
    if (lastActivity > 0) {
      const days = (now - lastActivity) / 86400000;
      if (days >= thresholdDays) {
        stalls.push({
          pipeline: u.pipeline, unit: u.unit,
          lastActivity: new Date(lastActivity).toISOString().slice(0, 10),
          days: Math.round(days),
        });
      }
    }
  }
  return stalls;
}

// ── Report Output ───────────────────────────────────────────

function printReport(units) {
  const classified = units.map(classifyUnit);
  const gates      = aggregateGates(classified);
  const cycleTimes = computeCycleTimes(classified);
  const alerts     = collectAlerts(classified);

  const completed = classified.filter(u =>
    u.status?.unitStatus === 'complete'
  );
  const clean    = completed.filter(u => u.classification === 'CLEAN');
  const rate     = completed.length > 0
    ? (clean.length / completed.length * 100).toFixed(1) : 'N/A';

  const now = new Date().toISOString().slice(0, 10);
  console.log(`ACU PULSE — Pipeline Health Metrics`);
  console.log(`Scan date: ${now}`);
  console.log(`Units scanned: ${classified.length}`);
  console.log();

  // ── Unit table ──
  console.log('='.repeat(70));
  console.log('UNIT CLASSIFICATIONS');
  console.log('='.repeat(70));
  console.log(
    pad('Pipeline', 16) + pad('Unit', 28) + pad('Class', 14) +
    pad('Entries', 8) + 'S.Fail'
  );
  console.log('-'.repeat(70));
  for (const u of classified) {
    const s = u.stats;
    console.log(
      pad(u.pipeline, 16) + pad(u.unit, 28) + pad(u.classification, 14) +
      pad(String(s.totalEntries), 8) + String(s.structFails)
    );
  }
  console.log();

  // ── Autonomy rate ──
  console.log('='.repeat(60));
  console.log('AUTONOMY RATE');
  console.log('='.repeat(60));
  console.log(`All units:       ${classified.length}`);
  console.log(`Completed:       ${completed.length}`);
  console.log(`  Blocked:       ${classified.filter(u => u.classification === 'BLOCKED').length}`);
  console.log(`  Clean:         ${clean.length}`);
  console.log(`  Near-clean:    ${completed.filter(u => u.classification === 'NEAR-CLEAN').length}`);
  console.log(`  Troubled:      ${completed.filter(u => u.classification === 'TROUBLED').length}`);
  console.log(`  Rate:          ${rate}%  (${clean.length} / ${completed.length})`);
  console.log();

  // ── Gate pass rates ──
  console.log('='.repeat(60));
  console.log('GATE PASS RATES');
  console.log('='.repeat(60));
  console.log(pad('Gate', 28) + pad('Pass', 7) + pad('Fail', 7) + 'Rate');
  console.log('-'.repeat(50));
  const sorted = Object.entries(gates).sort((a, b) => {
    const ra = a[1].pass / (a[1].pass + a[1].fail);
    const rb = b[1].pass / (b[1].pass + b[1].fail);
    return ra - rb;
  });
  for (const [name, g] of sorted) {
    const total = g.pass + g.fail;
    const pct = total > 0 ? (g.pass / total * 100).toFixed(0) + '%' : 'N/A';
    console.log(pad(name, 28) + pad(String(g.pass), 7) + pad(String(g.fail), 7) + pct);
  }
  console.log();

  // ── Alerts ──
  console.log('='.repeat(60));
  console.log('ALERTS');
  console.log('='.repeat(60));
  if (alerts.length === 0) {
    console.log('(none)');
  } else {
    for (const a of alerts) console.log(a);
  }
  console.log();

  // ── Cycle times ──
  if (cycleTimes.length > 0) {
    console.log('='.repeat(60));
    console.log('CYCLE TIMES');
    console.log('='.repeat(60));
    console.log(pad('Pipeline', 16) + pad('Unit', 28) + pad('Stage', 16) + 'Duration');
    console.log('-'.repeat(70));
    for (const t of cycleTimes) {
      console.log(
        pad(t.pipeline, 16) + pad(t.unit, 28) +
        pad(t.stage, 16) + formatDuration(t.ms)
      );
    }
    console.log();
  }

  // ── Gate analytics ──
  const firstPassRates = computeFirstPassRates(classified);
  const retryTimes = computeRetryTimes(classified);
  const failureCauses = aggregateFailureCauses(classified);

  console.log('='.repeat(60));
  console.log('GATE ANALYTICS');
  console.log('='.repeat(60));

  // First-pass rates
  console.log('First-pass rate (PASS on first attempt per unit):');
  console.log(pad('  Gate', 30) + pad('1st Pass', 10) + pad('Total', 8) + 'Rate');
  console.log('  ' + '-'.repeat(52));
  const fprSorted = Object.entries(firstPassRates).sort((a, b) => {
    const ra = a[1].total > 0 ? a[1].firstPass / a[1].total : 1;
    const rb = b[1].total > 0 ? b[1].firstPass / b[1].total : 1;
    return ra - rb;
  });
  for (const [name, r] of fprSorted) {
    const pct = r.total > 0 ? (r.firstPass / r.total * 100).toFixed(0) + '%' : 'N/A';
    console.log(pad('  ' + name, 30) + pad(String(r.firstPass), 10) + pad(String(r.total), 8) + pct);
  }
  console.log();

  // Retry times
  if (retryTimes.length > 0) {
    const avgRetry = retryTimes.reduce((a, b) => a + b.ms, 0) / retryTimes.length;
    console.log(`Retry times: ${retryTimes.length} retries, avg ${formatDuration(avgRetry)} between fail->retry`);
    console.log();
  }

  // Top failure causes
  if (failureCauses.length > 0) {
    console.log('Top structural failure causes:');
    for (const c of failureCauses.slice(0, 10)) {
      const pipelineCount = c.pipelines.length === 1 ? `1 pipeline` : `${c.pipelines.length} pipelines`;
      console.log(`  ${String(c.count).padStart(3)}x  ${c.gate.padEnd(28)} ${c.desc} (${pipelineCount})`);
    }
    console.log();
  } else {
    console.log('Top structural failure causes: (no check-level data yet — run gates to populate)');
    console.log();
  }

  // ── Pipeline metrics ──
  const completionRates = computeCompletionRates(classified);
  const stageVelocity = computeStageVelocity(cycleTimes);
  const stalls = detectStalls(classified);

  console.log('='.repeat(60));
  console.log('PIPELINE METRICS');
  console.log('='.repeat(60));

  // Completion rates
  console.log('Completion rate (units reaching final stage):');
  console.log(pad('  Pipeline', 20) + pad('Complete', 10) + pad('Total', 8) + 'Rate');
  console.log('  ' + '-'.repeat(42));
  for (const [name, r] of Object.entries(completionRates)) {
    const pct = r.total > 0 ? (r.complete / r.total * 100).toFixed(0) + '%' : 'N/A';
    console.log(pad('  ' + name, 20) + pad(String(r.complete), 10) + pad(String(r.total), 8) + pct);
  }
  console.log();

  // Stage velocity
  if (Object.keys(stageVelocity).length > 0) {
    console.log('Stage velocity (avg time per stage):');
    console.log(pad('  Stage', 20) + pad('Avg', 12) + pad('Min', 12) + pad('Max', 12) + 'n');
    console.log('  ' + '-'.repeat(52));
    for (const [stage, v] of Object.entries(stageVelocity)) {
      console.log(
        pad('  ' + stage, 20) + pad(formatDuration(v.avg), 12) +
        pad(formatDuration(v.min), 12) + pad(formatDuration(v.max), 12) + String(v.count)
      );
    }
    console.log();
  }

  // Stall detection
  if (stalls.length > 0) {
    console.log('Stalled units (no gate transition in 14+ days):');
    for (const s of stalls) {
      console.log(`  [STALL] ${s.pipeline}/${s.unit} — last activity ${s.lastActivity} (${s.days} days ago)`);
    }
    console.log();
  }

  console.log(`--- ${classified.length} units | ${rate}% clean | ${alerts.length} alerts ---`);
}

// ── Alert Collection ────────────────────────────────────────

function collectAlerts(classified) {
  const alerts = [];

  // Stall detection alerts
  const stalls = detectStalls(classified);
  for (const s of stalls) {
    alerts.push(`[STALL] ${s.pipeline}/${s.unit}: no gate transition in ${s.days} days (last: ${s.lastActivity})`);
  }

  return alerts;
}

// ── JSON Output ─────────────────────────────────────────────

function printJSON(units) {
  const classified = units.map(classifyUnit);
  const gates      = aggregateGates(classified);
  const cycleTimes = computeCycleTimes(classified);
  const alerts     = collectAlerts(classified);

  const completed  = classified.filter(u => u.status?.unitStatus === 'complete');
  const clean      = completed.filter(u => u.classification === 'CLEAN');

  const firstPassRates  = computeFirstPassRates(classified);
  const retryTimes      = computeRetryTimes(classified);
  const failureCauses   = aggregateFailureCauses(classified);
  const completionRates = computeCompletionRates(classified);
  const stageVelocity   = computeStageVelocity(cycleTimes);
  const stalls          = detectStalls(classified);

  console.log(JSON.stringify({
    scan_date: new Date().toISOString(),
    units: classified.map(u => ({
      pipeline: u.pipeline,
      unit: u.unit,
      classification: u.classification,
      stats: u.stats,
    })),
    autonomy: {
      total: classified.length,
      completed: completed.length,
      clean: clean.length,
      rate: completed.length > 0 ? +(clean.length / completed.length * 100).toFixed(1) : null,
    },
    gates,
    gate_analytics: {
      first_pass_rates: firstPassRates,
      retry_times: retryTimes.map(t => ({ ...t, duration: formatDuration(t.ms) })),
      failure_causes: failureCauses,
    },
    pipeline_metrics: {
      completion_rates: completionRates,
      stage_velocity: Object.fromEntries(
        Object.entries(stageVelocity).map(([k, v]) => [k, {
          ...v, avg: formatDuration(v.avg), min: formatDuration(v.min), max: formatDuration(v.max),
        }])
      ),
      stalls,
    },
    cycle_times: cycleTimes.map(t => ({ ...t, duration: formatDuration(t.ms) })),
    alerts,
  }, null, 2));
}

// ── Entry Point ─────────────────────────────────────────────

const args  = process.argv.slice(2);
const units = findUnits();

if (args.includes('--json')) {
  printJSON(units);
} else if (args.includes('--alerts')) {
  const alerts = collectAlerts(units.map(classifyUnit));
  if (alerts.length === 0) console.log('(no alerts)');
  else alerts.forEach(a => console.log(a));
} else {
  printReport(units);
}
