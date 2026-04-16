# Pipeline Generation Reflections

Observations from `/acu-new` runs. Template improvements and patterns that recur across domains.

## SboxDevKit — 2026-04-15

**What worked well:**
- Build archetype was a strong match — 5 stages (Research through Ship) naturally mapped to the software development lifecycle for a game framework.
- Parallel execution on Research (split_by_subtask, 3 workers) and Design (competing, 2 workers) fit the domain perfectly: research benefits from covering multiple angles simultaneously, and design benefits from competing approaches that let semantic eval pick the most beginner-friendly API.
- The full eval chain (stage + pipeline + system) is justified here because cross-module consistency is critical — 8+ modules need to feel like one cohesive framework.
- Observability enabled from day one since there's a Langfuse instance already configured.

**What was missing from templates:**
- No template support for "deadline-aware" pipeline behavior — s&box launches April 28, 2026 and the pipeline should surface timeline pressure. Had to encode this in the pipeline CLAUDE.md prose manually.
- The `observability.env` template defaults to `localhost:3000` but the user's Langfuse instance is on US cloud. Needed manual override — consider making the template prompt for the host URL.

**Suggested template improvements:**
- Consider adding an optional `target_date` field to pipeline frontmatter so gates and status views can surface time-to-deadline.
- The `observability.env.template` could include a comment block for cloud vs self-hosted with separate example values.
- For build-archetype pipelines with tooling, the registry could benefit from a "discovery" section that gets populated during Research rather than requiring all tools upfront.

## TechContent — 2026-04-16

**What worked well:**
- Document archetype (lean 3-stage variant: Draft -> Edit -> Publish) was the right match. Dropping Research and Outline stages was justified because the pipeline writes about topics the author already knows — a separate research stage would add overhead without value.
- STYLE.md as a pipeline-level artifact is a new pattern not covered by templates. It acts as a voice constraint file referenced by every stage CLAUDE.md. This worked well as a domain-specific file beyond what templates cover.
- Composite gate_type (structural + semantic) is justified here because voice consistency can't be checked structurally — the Edit stage eval-gate.md checks for AI patterns, corporate speak, and voice authenticity.
- Corporate speak pattern matching in gate-edit-to-publish.sh is a structural approximation of voice checking (grep for "Furthermore", "leverage", "synergy", etc.). Works as a first-pass filter before semantic eval catches subtler issues.

**What was missing from templates:**
- No template pattern for "style guide as constraint file." STYLE.md is domain-specific but the pattern (a reference file that every stage must read before producing output) could be generalized. Consider a `{{REFERENCE_FILES}}` placeholder in stage CLAUDE.md templates for mandatory pre-read files.
- The voice analysis process that produced STYLE.md required external writing samples from the user — Discord messages, personal stories, D&D character backgrounds. The pipeline intake has no mechanism for "bring your own writing samples." This was a pre-pipeline conversation step.

**Suggested template improvements:**
- Consider an optional `reference_files:` field in stage frontmatter — a list of files the LLM must read before executing the stage. Currently handled via prose in Methodology sections, but a frontmatter field would make it machine-checkable.
- For content-type pipelines, a "voice profile" template could standardize how writing style is captured. Fields: sentence flow, punctuation patterns, tone, vocabulary, anti-patterns. This would make STYLE.md replicable across different authors.

## CareerLaunch — 2026-04-15

**What worked well:**
- Document archetype was the right match. The pipeline is fundamentally about producing structured content (resume, profiles, outreach materials) through an audience-aware process.
- 4 stages at ~2 weeks each maps cleanly to a 2-month job search timeline. Audit and Rebrand are distinct enough to warrant separation — trying to combine them would produce an unfocused first stage.
- Citation enforcement on the Audit stage (Rule H) adds real value here: forces gap analysis to be grounded in actual job market data rather than assumptions about what AI roles require.
- No tooling phase was correct — platforms like LinkedIn and GitHub are operator-used, not automated. Forcing a registry for "LinkedIn" would have been template filler.
- Gate checks for section headers (Resume, LinkedIn, Portfolio, Content Calendar, Application Targets) provide concrete structural validation without being overly rigid about content format.

**What was missing from templates:**
- No template pattern for "reusable across different operators" pipelines. The intake template assumes a single operator per pipeline domain, but CareerLaunch is designed for a strategist to run campaigns for different candidates. The intake schema works but could be clearer about multi-user intent.
- The report template's "Classification" field is vestigial for non-security domains. The conditional reporting block (Rule D) handles intake, but the report template still has a Classification row in the summary table. Could use conditional logic there too.

**Suggested template improvements:**
- Consider a `pipeline_mode` frontmatter field: `single-operator` vs `multi-operator` — this would help `/acu-start` know whether to ask "who is the candidate?" vs "who is the operator?".
- The Approaches table works well for methodology-only domains when populated with "Manual" resources, but the column header "Resources" is slightly misleading when everything is manual. A context-aware label ("Resources / Tools" vs just "Resources") could help.
