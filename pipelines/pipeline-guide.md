# Using an Acu Pipeline — A Plain English Guide

A reference for colleagues and collaborators. No technical background required.

---

## What is a pipeline?

Think of a pipeline like a **board game with rules about when you're allowed to advance**.

A structured process for doing a specific type of work — writing a blog post, responding to a server outage, reviewing code. The pipeline breaks that work into phases, and you can only move forward once each phase is genuinely done. An AI assistant (Claude) helps you do the work inside each phase.

---

## What is a "unit"?

One piece of work going through the pipeline.

If the pipeline is for writing blog posts, one unit is one blog post. If it's for incidents, one unit is one incident. Starting a unit means filling out a short brief about this specific job before you begin — the name, who's working on it, what the goal is. Think of it like filling in the top of a form before you start answering the questions.

---

## How you move through it

The pipeline has phases in order. You do the work for phase one, then a checklist runs automatically to make sure you actually finished — files exist, nothing is left blank, no outstanding flags. If the checklist passes, you move to phase two. If it fails, it tells you exactly what is missing. You fix that one thing and try again. You cannot skip phases or mark yourself done manually.

---

## What the AI does

Claude reads the instructions for the current phase, helps you produce the output for that phase (writing, analysis, review — whatever the domain requires), and then runs the checklist when you're ready to advance. You approve the checklist run before it happens — you are never cut out of the loop.

---

## What "done" looks like

Every phase produces a real document — a written review, a finished draft, a decision log. Nothing lives only in the conversation. At the end of the last phase, a final checklist confirms the whole thing is complete and properly documented.

---

## How to use it — step by step

**1. Read the pipeline guide first**
Before touching anything, ask Claude to load the pipeline. It will show you the routing table (a menu of where to go based on what you want to do) and the lifecycle (the numbered steps for one full run).

**2. Fill out the intake form and hand it to Claude**
Use the template below. Fill it in, then say: *"Start a new unit with this"* — Claude creates the folder, loads the intake, and takes it from phase one.

**3. Work through each phase**
Claude helps you produce the output for each phase. When you're done with a phase, tell Claude you're ready to advance. It will propose running the checklist — approve it.

**4. If the checklist fails, fix what it names**
The failure message will tell you exactly what is missing or incomplete. Fix that specific thing — do not guess or workaround it.

**5. Repeat until the final phase passes**
At the end, a completion check confirms everything is in order. The unit is done and fully documented.

> **Short version:** Fill in the brief → work phase by phase → approve each checkpoint → fix what the checklist names if it fails.

---

## Starting a New Unit — Intake Form

Fill this out before doing any work. One form per job. Hand it to Claude alongside the pipeline name.

```
ABOUT THIS PIECE OF WORK
─────────────────────────────────────────────
ID (a number, e.g. 001, 002):     ___________
Short label (2–4 words, no spaces, e.g. intro-to-rust):  ___________
What is this about? (one sentence):
  __________________________________________________
Who is doing the work?            ___________
Date started:                     ___________


WHAT WE'RE TRYING TO MAKE
─────────────────────────────────────────────
Working title or name:            ___________
Who is this for? (the audience):
  __________________________________________________
What makes this one unique or timely?
  __________________________________________________
Format or type (e.g. how-to, case study, feature, bugfix):
  ___________


TARGETS
─────────────────────────────────────────────
Target completion date:           ___________
Any size or scope requirements? (e.g. word count, area of codebase):
  __________________________________________________


RULES FOR THIS JOB
─────────────────────────────────────────────
Tone or style to follow (if any):
  __________________________________________________
Anything that must be true before this is considered done?
  __________________________________________________
Does someone else need to review and approve before it's finished?
  YES / NO     If yes, who: ___________
```

---

## Files in this folder

| File | What it is |
|------|------------|
| `pipeline-guide.md` | This document — plain English guide + intake form |
