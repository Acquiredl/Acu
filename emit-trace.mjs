#!/usr/bin/env node
/**
 * emit-trace.mjs — Emit OTel-compatible traces to Langfuse.
 *
 * Called from advance.sh after audit log writes when observability is enabled.
 * Best-effort: never blocks gate transitions. Failures print [WARN] to stderr.
 *
 * Usage:
 *   node emit-trace.mjs --type gate|eval|stage \
 *     --pipeline <name> --unit <id> --gate <transition> \
 *     --result <PASS|FAIL> --layer <structural-checks|semantic-evaluation> \
 *     --session <id> --config <path/to/observability.env> \
 *     [--score <0.0-1.0>] [--model <name>] [--retry <count>] \
 *     [--data '<json>']
 *
 *   echo '<json-audit-entry>' | node emit-trace.mjs --stdin --config <path>
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ── Argument Parsing ──────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--stdin') { args.stdin = true; continue; }
    if (argv[i].startsWith('--') && i + 1 < argv.length) {
      args[argv[i].slice(2)] = argv[++i];
    }
  }
  return args;
}

// ── Environment Loading ───────────────────────────────────

function loadConfig(configPath) {
  const env = {};
  if (configPath && existsSync(configPath)) {
    const lines = readFileSync(configPath, 'utf-8').split('\n');
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

// ── Trace Emission ────────────────────────────────────────

async function emit(args) {
  const config = loadConfig(args.config);

  if (!config.publicKey || !config.secretKey) {
    process.stderr.write('[WARN] OTel emission skipped: Langfuse keys not configured\n');
    return;
  }

  // Dynamic import — only loaded when actually emitting
  const { Langfuse } = await import('langfuse');

  const langfuse = new Langfuse({
    publicKey: config.publicKey,
    secretKey: config.secretKey,
    baseUrl: config.baseUrl || config.host,
  });

  const traceId = `unit-${args.pipeline}-${args.unit}`;
  const timestamp = new Date().toISOString();

  try {
    // Create or resume trace for this work unit
    const trace = langfuse.trace({
      id: traceId,
      name: `${args.pipeline}/${args.unit}`,
      metadata: {
        pipeline: args.pipeline,
        unit: args.unit,
        session: args.session,
      },
      sessionId: args.session,
    });

    if (args.type === 'gate' || args.type === 'eval') {
      const spanName = args.type === 'eval'
        ? `eval:${args.gate}`
        : `gate:${args.gate}`;

      const span = trace.span({
        name: spanName,
        metadata: {
          gate: args.gate,
          layer: args.layer || 'structural-checks',
          result: args.result,
          session: args.session,
          ...(args.score && { score: parseFloat(args.score) }),
          ...(args.model && { model: args.model }),
          ...(args.retry && { retry: parseInt(args.retry) }),
        },
        level: args.result === 'FAIL' ? 'ERROR' : args.result === 'WARN' ? 'WARNING' : 'DEFAULT',
      });

      // Add individual check events from --data JSON
      if (args.data) {
        try {
          const data = JSON.parse(args.data);
          if (data.checks && Array.isArray(data.checks)) {
            for (const check of data.checks) {
              span.event({
                name: `check:${check.result}`,
                metadata: { result: check.result, desc: check.desc },
                level: check.result === 'FAIL' ? 'ERROR' : check.result === 'WARN' ? 'WARNING' : 'DEFAULT',
              });
            }
          }
          if (data.criteria_results && Array.isArray(data.criteria_results)) {
            for (const cr of data.criteria_results) {
              span.event({
                name: `eval-criterion:${cr.result}`,
                metadata: { criterion: cr.criterion, result: cr.result, detail: cr.detail },
                level: cr.result === 'FAIL' ? 'ERROR' : cr.result === 'WARN' ? 'WARNING' : 'DEFAULT',
              });
            }
          }
        } catch { /* ignore malformed --data */ }
      }

      // Score the trace if semantic evaluation
      if (args.type === 'eval' && args.score) {
        trace.score({
          name: 'semantic-quality',
          value: parseFloat(args.score),
          comment: `Gate: ${args.gate}, Model: ${args.model || 'unknown'}`,
        });
      }

      span.end();
    } else if (args.type === 'parallel') {
      // Parallel execution spans: worker, merge, or select
      if (args.worker) {
        // Individual worker span
        trace.span({
          name: `worker:${args.worker}`,
          metadata: {
            strategy: args.strategy,
            worker: args.worker,
            subtask: args.subtask || null,
            persona: args.persona || null,
            model: args.model || null,
            result: args.result,
          },
          level: args.result === 'FAIL' ? 'ERROR' : 'DEFAULT',
        }).end();
      } else if (args.merge === 'true') {
        // Merge span
        trace.span({
          name: `merge:${args.gate}`,
          metadata: {
            strategy: args.strategy,
            merge_mode: 'synthesize',
            model: args.model || null,
            result: args.result,
          },
        }).end();
      } else if (args.select === 'true') {
        // Selection span
        const selectSpan = trace.span({
          name: `select:${args.gate}`,
          metadata: {
            strategy: args.strategy,
            model: args.model || null,
            result: args.result,
          },
        });
        // Add selection data from --data
        if (args.data) {
          try {
            const data = JSON.parse(args.data);
            if (data.winner) {
              selectSpan.event({
                name: 'selection-winner',
                metadata: { winner: data.winner, scores: data.scores },
              });
              trace.score({
                name: 'parallel-selection',
                value: data.scores?.[data.winner] || 0,
                comment: `Strategy: ${args.strategy}, Winner: ${data.winner}`,
              });
            }
          } catch { /* ignore malformed --data */ }
        }
        selectSpan.end();
      }
    } else if (args.type === 'stage') {
      // Stage entry/exit event
      trace.event({
        name: `stage:${args.result === 'entered' ? 'entered' : 'completed'}`,
        metadata: {
          stage: args.gate, // reuse --gate for stage name
          action: args.result,
        },
      });
    }

    // Flush async — SDK batches and sends in background
    await langfuse.flushAsync();
  } catch (err) {
    process.stderr.write(`[WARN] OTel emission failed: ${err.message}\n`);
  } finally {
    await langfuse.shutdownAsync().catch(() => {});
  }
}

// ── Stdin Mode ────────────────────────────────────────────

async function emitFromStdin(args) {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  try {
    const entry = JSON.parse(input.trim());
    await emit({
      ...args,
      type: entry.layer === 'semantic-evaluation' ? 'eval' : 'gate',
      pipeline: entry.pipeline || args.pipeline,
      unit: entry.unit || args.unit,
      gate: entry.gate,
      result: entry.result,
      layer: entry.layer,
      session: entry.session || args.session,
      score: entry.score?.toString(),
      model: entry.model,
      retry: entry.retry?.toString(),
      data: entry.checks ? JSON.stringify({ checks: entry.checks }) : undefined,
    });
  } catch (err) {
    process.stderr.write(`[WARN] OTel stdin parse failed: ${err.message}\n`);
  }
}

// ── Main ──────────────────────────────────────────────────

const args = parseArgs(process.argv);

if (args.stdin) {
  emitFromStdin(args).catch(err => {
    process.stderr.write(`[WARN] OTel emission failed: ${err.message}\n`);
  });
} else if (args.type && args.pipeline && args.unit) {
  emit(args).catch(err => {
    process.stderr.write(`[WARN] OTel emission failed: ${err.message}\n`);
  });
} else {
  process.stderr.write('Usage: node emit-trace.mjs --type gate|eval|stage --pipeline <name> --unit <id> --gate <transition> --result <PASS|FAIL> --config <path>\n');
  process.exit(1);
}
