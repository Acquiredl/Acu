# Pipelines — Active Project Index

All project work lives here. Each pipeline is self-contained — route into one, then work entirely within that pipeline's directory.

## Identity

Lightweight index. Route to the correct pipeline based on domain, then load that pipeline's CLAUDE.md. No domain work happens here.

## Active Pipelines

| Pipeline | Domain | Stages | Status | Description |
|----------|--------|--------|--------|-------------|
| *(none yet — run `/acu-new` to generate your first pipeline)* | | | | |

## Routing Table

| Intent | Go To | Read |
|--------|-------|------|
| Generate a new pipeline | — | Use `/acu-new` skill |

## Resources

- [Pipeline Guide](pipeline-guide.md) — How Acu pipelines work

## Constraints

- Pipelines are products of the framework, not part of it. They operate independently after creation.
- Pipelines do not reference or depend on each other. Cross-pipeline work routes through the root workspaces.
- To modify an existing pipeline's structure, start a brainstorm (`/acu-brainstorm`) first.
