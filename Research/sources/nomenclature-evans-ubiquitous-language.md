---
title: "Evans — Ubiquitous Language (Domain-Driven Design)"
date: 2026-04-16
frame: nomenclature
primary_citation: "Evans, E. (2003). Domain-Driven Design: Tackling Complexity in the Heart of Software. Addison-Wesley."
secondary_citations:
  - "Evans, E. (2015). Domain-Driven Design Reference. https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf"
  - "Fowler, M. Ubiquitous Language. https://martinfowler.com/bliki/UbiquitousLanguage.html"
  - "Agile Alliance. What is Ubiquitous Language? https://agilealliance.org/glossary/ubiquitous-language/"
---

# Key Idea

**Ubiquitous Language** is the principle that *one* vocabulary is used by domain experts, developers, code, documentation, and UI. Every term has the same meaning everywhere. Synonyms are a defect. Context-specific jargon without cross-reference is a defect.

## Defining properties

- **One name per thing.** If two names exist for the same concept, either merge them or they refer to two different concepts (in which case clarify).
- **The code speaks the domain.** Class names, method names, file paths, CLI flags all use domain terms — not invented synonyms, not translator-layer vocabulary.
- **The domain speaks the code.** When a stakeholder says "pipeline stage," it is because the artefact is literally a `stages/` directory, not because the dev translated from "phase" or "step."
- **Refactor the language, not just the code.** When the domain reveals a better term, change it everywhere — or isolate it in a Bounded Context with an explicit translation boundary.

## Implication for Acu

Acu carries **several parallel vocabularies**:

| Vocabulary | Where it lives | Ubiquitous? |
|---|---|---|
| Pipeline / stage / gate / work unit | Templates, CLAUDE.md, gate scripts | **Yes** — consistent from code to docs |
| Teacher / faculty head / uniboss | eval-gate.md, eval-pipeline.md, eval-system.md | **Partial** — only in eval templates; users never type these |
| Sauron | Sauron/CLAUDE.md, REVIEW-LOG.md | **Partial** — aliases "scheduler/dispatcher" which is the real role |
| Workspace names (Brainstorming, Research, Production, Learning) | CLAUDE.md root | **Yes** |

Evans' test: **can a new user say what they mean without a translator?** If "teacher," "faculty head," and "uniboss" must be decoded to "stage evaluator," "pipeline evaluator," "system evaluator," then the university vocabulary is a **parasitic second language** — exactly the anti-pattern Evans names.

## Acu-relevant quote

> "By using a language based on the domain model and used throughout the team to connect all the activities of the team with the software... the team uses the language in all communication as well as the code. Call this the UBIQUITOUS LANGUAGE." — Evans, *DDD*

The practical rule: **if a name appears in template prose but never in a field, CLI flag, or directory path, ask why it exists.**
