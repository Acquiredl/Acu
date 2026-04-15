#!/usr/bin/env node
/**
 * export-traces.mjs — Batch export audit logs to Langfuse.
 *
 * Reads .audit-log.jsonl files across all pipelines and exports them
 * as OTel-compatible traces to Langfuse. Safe to re-run (deduplicates
 * by span ID). Use for backfilling historical data or migrating instances.
 *
 * Usage:
 *   node export-traces.mjs                          Export all audit logs
 *   node export-traces.mjs --pipeline BookReview    Export one pipeline
 *   node export-traces.mjs --since 2026-04-01       Export from date
 *   node export-traces.mjs --dry-run                Show what would be exported
 *   node export-traces.mjs --config path/to/env     Use specific config file
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PIPELINES_DIR = join(__dirname, 'pipelines');
const ROADMAP_DIR = join(__dirname, '_roadmap');

// ── Argument Parsing ──────────────────────────────────────

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dry-run') { args.dryRun = true; continue; }
    if (argv[i].startsWith('--') && i + 1 < argv.length) {
      args[argv[i].slice(2)] = argv[++i];
    }
  }
  return args;
}

// ── Config Loading ────────────────────────────────────────

function loadConfig(configPath) {
  const envPath = configPath || join(__dirname, 'observability.env');
  const env = {};
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return {
    host: env.LANGFUSE_HOST || process.env.LANGFUSE_HOST || 'http://localhost:3000',
    publicKey: env.LANGFUSE_PUBLIC_KEY || process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: env.LANGFUSE_SECRET_KEY || process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: env.LANGFUSE_BASEURL || env.LANGFUSE_HOST || process.env.LANGFUSE_BASEURL || undefined,
  };
}

// ── Audit Log Collection ──────────────────────────────────

function findAuditLogs(pipelineFilter) {
  const logs = [];
  const dirs = [PIPELINES_DIR, ROADMAP_DIR];

  for (const baseDir of dirs) {
    if (!existsSync(baseDir)) continue;

    if (baseDir === ROADMAP_DIR) {
      walkForLogs(baseDir, '_roadmap', logs);
      continue;
    }

    for (const pipeline of readdirSync(baseDir)) {
      if (pipeline === '_graveyard' || pipeline.startsWith('.')) continue;
      if (pipelineFilter && pipeline !== pipelineFilter) continue;
      const pipelineDir = join(baseDir, pipeline);
      if (!statSync(pipelineDir).isDirectory()) continue;
      walkForLogs(pipelineDir, pipeline, logs);
    }
  }

  return logs;
}

function walkForLogs(dir, pipeline, logs) {
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_')) {
        walkForLogs(fullPath, pipeline, logs);
      } else if (entry.name === '.audit-log.jsonl') {
        const unit = basename(dir);
        const entries = readFileSync(fullPath, 'utf-8')
          .split('\n')
          .filter(l => l.trim())
          .map(l => { try { return JSON.parse(l); } catch { return null; } })
          .filter(Boolean);
        if (entries.length > 0) {
          logs.push({ pipeline, unit, path: fullPath, entries });
        }
      }
    }
  } catch { /* skip unreadable dirs */ }
}

// ── Export ─────────────────────────────────────────────────

async function exportTraces(args) {
  const config = loadConfig(args.config);
  const sinceDate = args.since ? new Date(args.since) : null;
  const auditLogs = findAuditLogs(args.pipeline);

  if (auditLogs.length === 0) {
    console.log('No audit logs found.');
    return;
  }

  let totalTraces = 0;
  let totalSpans = 0;
  let totalEvents = 0;

  if (args.dryRun) {
    console.log('DRY RUN — no data will be exported\n');
  }

  // Group by pipeline+unit for traces
  const traces = new Map();
  for (const log of auditLogs) {
    const traceKey = `${log.pipeline}/${log.unit}`;
    if (!traces.has(traceKey)) traces.set(traceKey, { pipeline: log.pipeline, unit: log.unit, entries: [] });
    for (const entry of log.entries) {
      if (sinceDate && entry.ts && new Date(entry.ts) < sinceDate) continue;
      traces.get(traceKey).entries.push(entry);
    }
  }

  // Remove empty traces
  for (const [key, trace] of traces) {
    if (trace.entries.length === 0) traces.delete(key);
  }

  console.log(`Found ${traces.size} traces across ${auditLogs.length} audit log files\n`);

  if (args.dryRun) {
    for (const [key, trace] of traces) {
      const structural = trace.entries.filter(e => !e.layer).length;
      const checks = trace.entries.filter(e => e.layer === 'structural-checks').length;
      const evals = trace.entries.filter(e => e.layer === 'semantic-evaluation').length;
      console.log(`  ${key}: ${trace.entries.length} entries (${structural} gates, ${checks} check-layers, ${evals} evals)`);
      totalTraces++;
      totalSpans += structural + evals;
      totalEvents += trace.entries.filter(e => e.checks).reduce((a, e) => a + e.checks.length, 0);
    }
    console.log(`\nWould export: ${totalTraces} traces, ${totalSpans} spans, ${totalEvents} events`);
    return;
  }

  // Actual export
  if (!config.publicKey || !config.secretKey) {
    console.error('Error: Langfuse keys not configured. Set in observability.env or environment variables.');
    process.exit(1);
  }

  const { Langfuse } = await import('langfuse');
  const langfuse = new Langfuse({
    publicKey: config.publicKey,
    secretKey: config.secretKey,
    baseUrl: config.baseUrl || config.host,
  });

  for (const [key, traceData] of traces) {
    const traceId = `unit-${traceData.pipeline}-${traceData.unit}`;
    const trace = langfuse.trace({
      id: traceId,
      name: key,
      metadata: { pipeline: traceData.pipeline, unit: traceData.unit },
    });

    for (const entry of traceData.entries.sort((a, b) => (a.ts || '').localeCompare(b.ts || ''))) {
      // Gate-level entries (no layer field)
      if (!entry.layer) {
        const spanId = `${traceData.pipeline}-${traceData.unit}-${entry.gate}-${entry.ts}`;
        trace.span({
          id: spanId,
          name: `gate:${entry.gate}`,
          startTime: entry.ts ? new Date(entry.ts) : undefined,
          metadata: {
            gate: entry.gate,
            result: entry.result,
            session: entry.session,
            sha256: entry.sha256,
          },
          level: entry.result === 'FAIL' ? 'ERROR' : 'DEFAULT',
        }).end();
        totalSpans++;
      }

      // Structural check layer entries
      if (entry.layer === 'structural-checks' && entry.checks) {
        for (const check of entry.checks) {
          trace.event({
            name: `check:${check.result}`,
            metadata: { gate: entry.gate, result: check.result, desc: check.desc },
            level: check.result === 'FAIL' ? 'ERROR' : check.result === 'WARN' ? 'WARNING' : 'DEFAULT',
          });
          totalEvents++;
        }
      }

      // Semantic evaluation layer entries
      if (entry.layer === 'semantic-evaluation') {
        const spanId = `${traceData.pipeline}-${traceData.unit}-eval-${entry.gate}-${entry.ts}`;
        trace.span({
          id: spanId,
          name: `eval:${entry.gate}`,
          startTime: entry.ts ? new Date(entry.ts) : undefined,
          metadata: {
            gate: entry.gate,
            result: entry.result,
            model: entry.model,
            score: entry.score,
            retry: entry.retry,
          },
          level: entry.result === 'FAIL' ? 'ERROR' : 'DEFAULT',
        }).end();
        totalSpans++;

        if (typeof entry.score === 'number') {
          trace.score({
            name: 'semantic-quality',
            value: entry.score,
            comment: `Gate: ${entry.gate}, Model: ${entry.model || 'unknown'}`,
          });
        }
      }
    }

    totalTraces++;
    if (totalTraces % 10 === 0) process.stdout.write(`  Exported ${totalTraces} traces...\r`);
  }

  await langfuse.flushAsync();
  await langfuse.shutdownAsync().catch(() => {});

  console.log(`\nExported: ${totalTraces} traces, ${totalSpans} spans, ${totalEvents} events`);
}

// ── Main ──────────────────────────────────────────────────

const args = parseArgs(process.argv);
exportTraces(args).catch(err => {
  console.error(`Export failed: ${err.message}`);
  process.exit(1);
});
