---
source_type: secondary
title: Progressive disclosure in dev-tool onboarding — pattern survey
sources:
  - https://www.pendo.io/pendo-blog/onboarding-progressive-disclosure/
  - https://userpilot.com/blog/progressive-disclosure-examples/
  - https://www.loginradius.com/blog/identity/progressive-disclosure-user-onboarding
  - https://www.allstacks.com/blog/crawl-walk-run-part-4
  - https://ixdf.org/literature/topics/progressive-disclosure (Interaction Design Foundation, updated 2026)
retrieved: 2026-04-16
retrieval_method: WebSearch
citation_key: onboarding-progressive-disclosure-2026
---

# Progressive disclosure in product and dev-tool onboarding

## Consensus pattern: "minimum viable first success"

Across SaaS / dev-tool onboarding writing (Pendo, Userpilot, LoginRadius,
LogRocket), the recurring pattern is:

1. **Start with the minimal action** — create a profile, create an empty
   project, send one test message. Not: configure org structure, pick a
   plan, set permissions.
2. **Reveal optional features in time** — features appear when a prior
   action has been completed and the feature becomes meaningful.
3. **Defer configuration** — anything that isn't required to produce the
   first output is pushed behind a "settings" or "advanced" surface.
4. **Contextual help, not upfront tutorials** — help is attached to the
   feature at the moment the user needs it, not delivered as a wall of
   prose before the user has touched anything.

Pendo calls this "reducing the cognitive burden during the initial
experience so the user can reach a first success without memorizing
the product." LoginRadius frames it as "feature/navigation/options
revealed as the user advances through onboarding."

## The crawl / walk / run framing

From the Allstacks article (a software-metrics context, but the framing
is widely reused in dev-tool onboarding):

- **Crawl** — establish a baseline. Pick 3–4 key concepts. Gain
  visibility without drowning in data. Goal: the user can *describe*
  what they just did.
- **Walk** — add process. Introduce the next layer of concepts once
  the user is comfortable with the baseline. Goal: the user can
  *repeat* the action on a new target.
- **Run** — optimize. Surface advanced capabilities, cross-cutting
  concerns, customization, automation. Goal: the user can *extend*
  or *compose* what they have.

The rule of thumb is 3–4 concepts at Crawl. Anything beyond that
spills into Walk.

## Applied to dev-tool first-runs

Observed patterns in well-regarded dev-tool onboarding (Stripe,
Supabase, Vercel, Next.js):

- **One command to first output** (`npx create-*`, `stripe listen`,
  `supabase init`).
- **The command itself hides multi-file scaffolding** — the user sees
  a single verb and gets a directory back. They do not write the
  scaffolding by hand.
- **The generated project has a sample unit already working** — the
  first "run" is editing something that already runs, not writing
  something from zero.
- **Configuration knobs are deferred** — env vars, custom templates,
  plugins, CI integration all live in separate docs reached by search,
  not by linear reading.

## Application note for Acu

The crawl / walk / run framing suggests a three-band structure for
Acu concepts:

- **Crawl (tier 1, essential):** 3–4 concepts the user MUST hold in
  working memory to produce a first pipeline and pass a first gate.
- **Walk (tier 2, hideable):** concepts the user learns the *second*
  time they run the pipeline, or when they want to do something
  slightly more ambitious.
- **Run (tier 3, advanced):** concepts for customizing, extending, or
  operating Acu as a system (Sauron, archetypes, evaluation chains,
  parallel execution, observability, template versioning).

The "minimum viable first success" pattern is already partially
implemented in Acu via the sample unit (`001-sample/`) — the user
receives a working unit rather than having to write one. This is a
strong foundation; the question for the report is what *else* the
first-run user is forced to hold in working memory.
