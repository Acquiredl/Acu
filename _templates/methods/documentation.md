# Documentation — Style-Matched Generation

Applies to: ship/publish stages, post-build documentation, API reference generation.

## Modes

### Function-Level (doc comments)
1. Read existing doc comments and config to capture density, tone, tag conventions, and line length.
2. Classify each function as trivial (skip) or non-trivial (document).
3. For non-trivial functions, capture: purpose, parameter semantics (not types — the signature has those), return guarantees, throws, side effects, and non-obvious behavior.
4. Write using detected style. Re-read every doc and delete any that just restate the signature.

### Module-Level (READMEs)
1. Identify the module's role, key exports, internal structure, and dependency relationships.
2. Structure as a README: purpose, key exports with one-line descriptions, internal architecture (if non-obvious), and usage example.

### API Reference (endpoints/exports)
1. Document each endpoint's method, path, parameters, response shape, error cases, and auth requirements.
2. Group by resource or domain. Include request/response examples.

## Core Rule

Every doc must add information the signature alone cannot convey. If you can delete a doc comment and lose nothing, delete it.

## Gate Integration

Ship/publish exit gates may verify: public API has doc coverage, README exists for each top-level module, no TODO/FIXME in published docs.
