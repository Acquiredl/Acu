---
title: "du Boulay — Notional Machines"
date: 2026-04-16
frame: nomenclature
primary_citation: "du Boulay, B. (1986). Some difficulties of learning to program. Journal of Educational Computing Research, 2(1), 57-73."
secondary_citations:
  - "du Boulay, B., O'Shea, T., & Monk, J. (1981). The black box inside the glass box: presenting computing concepts to novices. International Journal of Man-Machine Studies, 14(3), 237-249."
  - "Sorva, J. (2013). Notional machines and introductory programming education. ACM Transactions on Computing Education, 13(2), Article 8. https://dl.acm.org/doi/10.1145/2483710.2483713"
  - "Shapiro, B. (2019). So what's a notional machine anyway? (guest post, Guzdial). https://computinged.wordpress.com/2019/07/15/so-whats-a-notional-machine-anyway-a-guest-blog-post-from-ben-shapiro/"
---

# Key Idea

A **notional machine** is the idealised model of the computer that a learner must internalise in order to predict and reason about program behaviour. It is *not* the real hardware; it is a pedagogical abstraction — "the best lie that explains what the computer does" (du Boulay).

## Defining Properties

- It is a **metaphor layer above the real machine**. Its fidelity is measured by predictive power for the learner, not by isomorphism to hardware.
- It is **implied by the constructs of the language or system** the learner is using. Each language / framework carries its own notional machine whether the designer acknowledges it or not.
- It is **the unit of understanding** — the learner has understood the system when they can predict the next state from the current state using the notional machine alone.

## Implication for Acu

Every name in Acu either reinforces the notional machine ("the filesystem *is* the program") or fights it. A name that demands the learner hold an extra model in their head (e.g., a Tolkien reference) grows the notional machine without increasing predictive power.

A name is **load-bearing** if removing it would force the learner to build a less predictive model. A name is **cultural tax** if removing it would leave the notional machine intact and the mechanic still understandable.

## Acu-relevant quote (paraphrased from Sorva, 2013)

> "A notional machine is an abstraction designed to provide a model to aid in understanding of a particular language construct or program execution... it presents a higher conceptual level by providing a metaphorical layer above the real machine."

Acu's strongest notional machine today: **filesystem-as-program, CLAUDE.md-as-instruction, gate-as-state-transition**. Evaluate each name against whether it serves this notional machine.
