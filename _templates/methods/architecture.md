# Architecture — Multi-Candidate Evaluation and Build Planning

Applies to: design stages, pipeline planning, converting research findings into actionable build sequences.

## Steps

1. **Extract requirements** — From a spec, handoff document, or user description, identify: core features, technical constraints, end conditions, and out-of-scope items. If working from existing code, infer these from the codebase.

2. **Evaluate options** — For every non-trivial decision (state management, API structure, auth pattern, schema design, component architecture), generate 2-3 candidates. Assess each on complexity, risk, maintainability, and implementability. Pick the winner with documented reasoning and name the rejected alternatives.

3. **Produce the architecture** —
   - File tree (complete for greenfield, delta-only for features)
   - Component breakdown per feature with dependencies
   - Data model (if applicable)
   - Key decisions with rejected alternatives
   - Phased build plan where every phase has verifiable end conditions
   - Risk register (what could go wrong, mitigation for each)

4. **Connect to pipeline** — Map architecture phases to pipeline stages. Each phase's end conditions become gate criteria for the corresponding stage transition.

## Visual Design (UI pipelines only)

For UI/visual pipelines, extend Step 3 with a design manifest:
- Color palettes (primary, neutral, semantic)
- Typography (font family, type scale, weights)
- Spacing (base unit, scale)
- Shape (radius, shadows)
- Component patterns and anti-patterns to flag

Extract from existing code when retrofitting (read Tailwind config, global CSS, 5-10 component files, identify values used 3+ times). Generate from scratch when starting new.

## Gate Integration

Design stage exit gates should verify: architecture document exists, all non-trivial decisions have evaluated alternatives, build phases have verifiable end conditions, file tree covers all features.
