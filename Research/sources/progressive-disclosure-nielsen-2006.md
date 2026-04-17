---
source_type: primary
author: Jakob Nielsen
title: Progressive Disclosure
publisher: Nielsen Norman Group
date_original: 2006-12-03
url: https://www.nngroup.com/articles/progressive-disclosure/
retrieved: 2026-04-16
retrieval_method: WebSearch (WebFetch denied for nngroup.com)
citation_key: nielsen2006-progressive-disclosure
---

# Progressive Disclosure — Jakob Nielsen (NN/g, 2006)

## Canonical definition

> "Progressive disclosure defers advanced or rarely used features to a secondary
> screen, making applications easier to learn and less error-prone."

## The two-tier structure

Nielsen frames progressive disclosure as a strict two-tier design:

1. **Initial display (tier 1)** — show only the *few most important* options.
   The fact that something appears on the initial display *itself* tells users
   it is important. This acts as an attention-prioritization signal for novices.

2. **Secondary display (tier 2)** — a larger set of specialized / advanced /
   rarely-used options, reachable on explicit request (e.g., an "Advanced
   options" button). Users who do not need these features never have to see
   or contemplate them.

Example used in the article: the OS print dialog. Common options (copies,
page range) are in tier 1; scaling, reverse-page-order, and other rarely-used
settings live behind the "Advanced" button in tier 2.

## Criteria for what goes where

Nielsen gives two working tests. A feature belongs on the initial display iff
it is:

- **Frequently used**, AND
- **Needed by most users** for their typical task.

A feature belongs on the secondary display iff it is:

- **Rarely used** (infrequent), OR
- **Specialized / advanced** (needed by few users), OR
- **Potentially confusing or error-inducing** for novices.

## Why it works (the design tension it resolves)

> "Users want power, features, and enough options to handle all of their
> special needs. Users want simplicity; they don't have time to learn a
> profusion of features in enough depth to select the few that are optimal
> for their needs. Progressive disclosure is one of the best ways to satisfy
> both of these conflicting requirements."

Hiding advanced settings:
- helps novices **avoid mistakes** (fewer wrong-feature errors),
- **saves time** they would have spent evaluating features they don't need,
- preserves the expert's ability to reach the full feature set on demand.

## Application note for Acu

Nielsen's framework maps cleanly onto documentation and directory structure,
not only onto GUIs. The "initial display" in a filesystem-as-program framework
is: the files a first-time user must read, the inputs they must supply, and
the concepts a CLAUDE.md forces on them. Anything required to produce a first
pipeline is tier 1; anything that can be learned after the first green gate
is tier 2.
