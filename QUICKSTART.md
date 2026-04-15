# Quickstart — Your First Acu Pipeline

Build a working pipeline in 5 minutes. By the end, you'll understand how Acu turns a directory structure into a controlled AI workflow.

## What is Acu?

Acu is a framework where **folders are the program** and **the AI is the runtime**.

Each directory has a `CLAUDE.md` file that tells the AI what to do in that context — what it's responsible for, what it can't do, and where to send work that isn't its. The AI reads that file and operates within those boundaries.

- **Sauron** — routes work to the right pipeline, reviews output, enforces structure
- **Pipelines** — isolated, self-contained projects, each with their own stages and rules
- **Stages** — steps within a pipeline (Research, Design, Build, etc.)
- **Gates** — deterministic checks at every stage transition. Work can't advance without passing.
- **Templates** — versioned blueprints that generate new pipelines with consistent structure

You don't write code to control the AI. You shape the environment it operates in.

## Step 1: Generate a pipeline

Run `/acu-new` in Claude Code. The generator asks 7 questions in one batch:

| # | Question | What it means |
|---|----------|---------------|
| 1 | Domain name + description | What is this pipeline for? |
| 2 | Stages (ordered) | What steps does work flow through? |
| 3 | Final deliverable | What does "done" look like? |
| 4 | Tools / resources | Any CLI tools, APIs, or manual procedures? |
| 5 | Standards | What methodology or framework governs quality? |
| 6 | Hard constraints | What must NEVER happen? |
| 7 | Work unit naming | What's a single run called? Who operates it? |

**Example answers for a "Book Review" pipeline:**

1. **BookReview** — Pipeline for reading books and producing structured reviews.
2. **Select → Read → Draft → Edit → Publish** — five stages.
3. A published review (markdown) with rating, summary, analysis, and recommendation.
4. No automated tooling. Manual process.
5. Reviews follow a consistent structure: no spoilers in summary, analysis grounded in quotes.
6. Never publish without completing the book. Never fabricate quotes.
7. A single run is a **review**. Operated by a **reviewer**.

The generator shows you the proposed design. Confirm it, and it builds the full pipeline directory with all structural files.

## Step 2: Explore what was created

After generation, look at what appeared in `pipelines/BookReview/`:

```
BookReview/
├── CLAUDE.md                    # Pipeline identity + routing table
├── .acu-meta.yaml              # Template version tracking
├── REFLECTIONS.md               # Lessons learned (empty, you'll fill it)
├── 1-Select/
│   └── CLAUDE.md                # Stage identity: "I help pick the next book"
├── 2-Read/
│   └── CLAUDE.md                # Stage identity: "I track reading progress"
├── 3-Draft/
│   └── CLAUDE.md                # Stage identity: "I write the first draft"
├── 4-Edit/
│   └── CLAUDE.md                # Stage identity: "I refine and tighten"
├── 5-Publish/
│   └── CLAUDE.md                # Stage identity: "I finalize and ship"
├── reviews/                     # Work units live here
├── templates/
│   ├── intake.yaml              # Template for creating a new review
│   ├── status.yaml              # Template for tracking review state
│   ├── intake.schema.yaml       # Validation schema for intake
│   └── status.schema.yaml       # Validation schema for status
└── gates/
    ├── gate-select-to-read.sh   # Transition validator
    ├── gate-read-to-draft.sh    # Transition validator
    ├── gate-draft-to-edit.sh    # Transition validator
    ├── gate-edit-to-publish.sh  # Transition validator
    └── advance.sh               # Gate orchestrator
```

Every `CLAUDE.md` in every stage scopes the AI's behavior for that context. As work moves through the pipeline, the AI's instructions change with it.

## Step 3: Create a work unit

Run `/acu-start` in Claude Code. It detects your pipeline, reads its templates, and asks you targeted questions:

```
Creating a new review in BookReview (next ID: 001)

1. Name — Short name for this review (e.g., "dune", "sapiens")
2. Description — What book are you reviewing?
3. Author — Who wrote it?
4. Target date — When do you want to publish?
```

Answer the questions, and it creates the unit directory with populated files:

```
reviews/001-dune/
├── intake.yaml    # Filled with your answers
└── status.yaml    # First stage set to in_progress
```

`intake.yaml` describes WHAT you're working on. `status.yaml` tracks WHERE it is in the pipeline. Together, they're a self-describing state machine. No manual copying, no blank templates to fill.

## Step 4: Do the work

Tell the AI: "Work on book review 001." Sauron reads `ROUTES.yaml`, routes to the BookReview pipeline, which reads `status.yaml` to find the current stage, then loads that stage's `CLAUDE.md`. The AI now knows exactly who it is and what to produce.

## Step 5: Pass a gate

When a stage's work is done, run the gate:

```bash
bash gates/advance.sh reviews/001-some-book/ select-to-read
```

The gate checks:
- Does `intake.yaml` match its schema?
- Does `status.yaml` match its schema?
- Are the stage-specific exit criteria met?

**Pass** → `status.yaml` advances to the next stage. An audit log entry is written.
**Fail** → Nothing changes. Fix the issue, try again.

No negotiation. No "close enough." The gate is a binary check.

## Step 6: Repeat until done

Work through each stage. Pass each gate. When the final stage completes, `status.yaml` shows `current_stage: published` and every stage shows `status: passed`.

The work unit has a complete, auditable history — every gate transition timestamped and logged.

## What just happened

You didn't configure an AI agent. You didn't write orchestration code. You didn't build a prompt chain.

You shaped a directory structure, and the AI operated within it — shifting roles at each level, enforcing quality at each gate, tracking state in plain YAML files.

The directory IS the program. The AI IS the runtime.

## Next steps

- **Try `/acu-check`** — scans your pipeline for structural compliance.
- **Try `/acu-observe`** — get a framework-wide health snapshot.
- **Break something** — edit a gate to be stricter. Change a CLAUDE.md constraint. See how the AI's behavior changes. The best way to understand the system is to push its boundaries.
