---
title: Cognitive Load Theory — Primary Source Excerpts
date: 2026-04-16
frame: cognitive-load
use: reference material for learning-friction-research (Phase 1, Item 2)
---

# Cognitive Load Theory — Source Excerpts

Canonical definitions and citations gathered for Acu's Cognitive Load inventory. Excerpts are paraphrased from secondary summaries where primary PDFs were not fetched; primary-source citations are retained so claims trace back to the canonical literature.

---

## 1. Sweller (1988) — the founding paper

**Citation:** Sweller, J. (1988). *Cognitive load during problem solving: Effects on learning.* Cognitive Science, 12(2), 257-285.
**URL:** https://onlinelibrary.wiley.com/doi/abs/10.1207/s15516709cog1202_4
**Full text mirror:** https://mrbartonmaths.com/resourcesnew/8.%20Research/Explicit%20Instruction/Cognitive%20Load%20during%20problem%20solving.pdf

Key claims:

- Human short-term (working) memory is severely limited. Any task that forces many items to be held simultaneously imposes heavy cognitive load and crowds out the processing capacity needed for *schema acquisition*.
- Conventional problem solving via means-ends analysis is a poor learning vehicle because the cognitive processes demanded by problem solving and by schema acquisition overlap insufficiently.
- Domain-specific schemas are the primary factor distinguishing experts from novices.
- Schema acquisition and automation are the two primary learning mechanisms.

Implication for design: reduce working-memory demands that are *not* paying for schema construction.

---

## 2. Sweller (2010) — element interactivity and the three-load decomposition

**Citation:** Sweller, J. (2010). *Element interactivity and intrinsic, extraneous, and germane cognitive load.* Educational Psychology Review, 22(2), 123-138.
**URL:** https://link.springer.com/article/10.1007/s10648-010-9128-5

Definitions (as synthesized from the paper and canonical summaries):

- **Intrinsic cognitive load** — load from the inherent complexity of the material, given the learner's prior knowledge. Measured via *element interactivity*: the number of information elements that must be processed simultaneously to understand the material. Intrinsic load is *relative* to expertise: what is high-interactivity for a novice may be a single chunk for an expert.
- **Extraneous cognitive load** — load imposed by *how* material is presented, not by the material itself. Caused by sub-optimal instructional design (e.g., disconnected text+diagram, redundant explanations, opaque jargon, ceremony that is not load-bearing). This load is *reducible* without sacrificing capability.
- **Germane cognitive load** — the working-memory resources actually allocated to schema construction and automation. In the 2010 revision, germane load is no longer an independent source of load; it is the share of working memory *productively absorbing* intrinsic-load element interactivity.

Consequences:
- Total load on working memory = intrinsic + extraneous (at any moment).
- If extraneous load is high, germane capacity shrinks and learning stalls.
- The design lever is extraneous load.

---

## 3. Chandler & Sweller (1992) — split-attention effect

**Citation:** Chandler, P., & Sweller, J. (1992). *The split-attention effect as a factor in the design of instruction.* British Journal of Educational Psychology, 62(2), 233-246.
**URL:** http://www.davidlewisphd.com/courses/EDD8121/readings/1992-ChandlerSweller-SplitAttention.pdf

Definition: when learners must mentally integrate two or more physically or temporally separated information sources (e.g., a diagram and a separate explanatory paragraph) before the material becomes intelligible, extraneous load spikes. Physical integration (labels on the diagram) removes the integration step and improves learning.

Implication for Acu: any time a user must jump between files, CLAUDE.md sections, skill docs, and gate scripts to understand what a single step does, the framework is imposing split-attention load.

---

## 4. Sweller & Cooper (1985) — worked-example effect

**Citation:** Sweller, J., & Cooper, G. A. (1985). *The use of worked examples as a substitute for problem solving in learning algebra.* Cognition and Instruction, 2(1), 59-89.
**URL:** https://notes.andymatuschak.org/zYHdLJ7TFdpcwGtqDChMNbm (Matuschak's note with citation and summary)

Definition: novices learn faster from studying worked examples than from solving isomorphic problems from scratch, because worked examples let working memory spend its budget on schema construction instead of search.

Implication for Acu: a beginner landing in a newly generated pipeline has no worked example unless the sample unit directory contains one. The "copy, then modify" path is cheaper than the "derive from templates" path.

---

## 5. Redundancy effect

**Primary citation (synthesized from multiple sources):** Chandler, P., & Sweller, J. (1991). *Cognitive load theory and the format of instruction.* Cognition and Instruction, 8(4), 293-332. See also Sweller, J. (2005/2006). *The redundancy principle in multimedia learning*, in Mayer (ed.), *Cambridge Handbook of Multimedia Learning*.
**URL (summary):** https://en.wikipedia.org/wiki/Cognitive_load

Definition: presenting the same information in multiple forms (narrated text + identical on-screen text, or an explanation that repeats what a diagram already shows) *increases* extraneous load rather than reinforcing learning. Best summarized as: "Eliminate unnecessary information. Do not replicate necessary information."

Implication for Acu: when gate criteria are duplicated in stage CLAUDE.md prose *and* in frontmatter *and* in gate scripts, each duplication is a candidate redundancy unless it serves a distinct audience (human reader vs. LLM vs. bash).

---

## 6. Element interactivity — the master variable

**Citation:** Sweller (2010), as above. Also summarized in Sweller, J., Ayres, P., & Kalyuga, S. (2011). *Cognitive Load Theory.* Springer. https://link.springer.com/book/10.1007/978-1-4419-8126-4

Definition: the count of information elements that must be processed *at the same time* to understand something. Low interactivity = elements can be learned in isolation. High interactivity = elements only make sense in relation to each other.

Measurement heuristic: walk a novice through the material and ask "at this step, how many previously-unfamiliar things must they be holding in mind to make sense of the next sentence?" The maximum along the path is the element-interactivity ceiling.

---

## Notes on methodology for this frame

- CLT evaluates a learner + material pair, not material in isolation. "Extraneous for a novice" can be "neutral for an expert" — the audit must fix a target user (here: first-time Acu user, first 30 minutes).
- CLT is prescriptive about *reducing extraneous load* and *matching intrinsic load to expertise*. It is not a blanket "simpler is better" argument — intrinsic complexity is fine if it is paying for schema construction.
- Hotspots are ranked by (load per encounter) × (frequency early in the path). Early extraneous load is more damaging because the learner has not yet built schemas that would let them chunk away the complexity.
