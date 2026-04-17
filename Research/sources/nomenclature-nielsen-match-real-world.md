---
title: "Nielsen — Match between system and the real world (Heuristic #2)"
date: 2026-04-16
frame: nomenclature
primary_citation: "Nielsen, J. (1994). 10 Usability Heuristics for User Interface Design. Nielsen Norman Group. https://www.nngroup.com/articles/ten-usability-heuristics/"
secondary_citations:
  - "Pencil & Paper. Match Between System and Real World. https://www.pencilandpaper.io/articles/match-between-system-and-the-real-world"
---

# Key Idea

Heuristic #2 of Nielsen's 10: **the system should speak the users' language** — words, phrases, and concepts familiar to the user — rather than system-oriented terms. Information should appear in a natural and logical order.

## Defining properties

- **Familiar over invented.** Prefer the term the user already uses for this thing over a new term the designer invented.
- **Real-world metaphors, where they fit.** If the user has a mental model from the physical world that maps well, use it (a "trash" icon, an "inbox"). If the mapping is forced, don't.
- **Natural order.** Workflow order should match the user's real-world expectation, not the system's internal convenience.

## The negative side

Nielsen also warns: **a metaphor that doesn't quite fit is worse than no metaphor**. It primes incorrect expectations that the user then has to unlearn. The classic UX failure is a "desktop" metaphor that breaks the moment the user tries to do something a real desktop can't do.

## Implication for Acu

The test for any Acu name: **what does a new user believe this word means before they've read any Acu docs?**

- "Pipeline" — user believes: ordered sequence of stages. Acu meaning: ordered sequence of stages. **Match.**
- "Stage" — user believes: a step in a process. Acu meaning: a step in a process. **Match.**
- "Gate" — user believes: a thing that opens/closes based on a condition. Acu meaning: a thing that passes/fails based on a condition. **Match.**
- "Sauron" — user believes: a Tolkien villain. Acu meaning: scheduler/dispatcher/reviewer. **Mismatch.** The user must unlearn the Tolkien connotation (surveillance, malevolence, centralisation of power) to arrive at the actual role.
- "Acu" — user believes: ??? (no prior referent). Acu meaning: the framework itself. **Empty slot** — neither match nor mismatch; the name is a blank label the user must fill with experience. This is the cheapest form of "cultural tax" — low cost per learner, but zero teaching value.

## Acu-relevant quote

> "The system should speak the users' language, with words, phrases and concepts familiar to the user, rather than system-oriented terms. Follow real-world conventions, making information appear in a natural and logical order." — Nielsen, Heuristic #2

Combined with Evans' Ubiquitous Language and Papert's microworld metaphor, this heuristic completes the triangulation: **a name earns its keep if (a) it predicts the mechanic (notional machine), (b) it is used consistently across code and docs (ubiquitous language), and (c) it matches a real-world concept the user already holds (match-to-real-world).**
