# quickstart — zero to pipeline

*\* this guide is actively being worked on. if something's unclear or missing, that's on me not you.*

this guide assumes you have never used Acu, never used Claude Code, and maybe never used a terminal. if that's not you and you just want the technical overview, read [README.md](README.md) instead.

## what is this thing

Acu is a framework that lets you orchestrate AI work using folders and files. you create a directory structure that describes what you want done, and the AI reads that structure and does the work. there's no code to write. no API to learn. you describe the environment, the AI operates within it.

think of it like setting up an office. you create departments (pipelines), each department has rooms (stages), and each room has a job description posted on the wall (CLAUDE.md). the AI walks into a room, reads the job description, does the work, and moves to the next room. between rooms there's a security guard (gate) that checks if the work meets the requirements before letting it through.

## what you need

3 things:

1. **Git** — to clone the repo. if you don't have it: [git-scm.com/downloads](https://git-scm.com/downloads). install it, all defaults are fine.

2. **Claude Code** — the AI that runs inside the framework. pick whichever way works for you:
   - **VS Code extension** — if you already use VS Code, install the Claude Code extension from the marketplace. open the extensions panel (Ctrl+Shift+X), search "Claude Code", install it.
   - **Claude Desktop app** — download from [claude.ai/download](https://claude.ai/download). works on Mac and Windows.
   - **CLI** — if you're comfortable with terminals: `npm install -g @anthropic-ai/claude-code`

3. **An Anthropic API key** — Claude Code needs this to talk to the AI. get one at [console.anthropic.com](https://console.anthropic.com). it's pay-per-use, a typical pipeline run costs a few cents depending on the model and how much work is involved.

## step 1: clone the repo

open a terminal (or the terminal inside VS Code) and run:

```bash
git clone https://github.com/Acquiredl/Acu.git
cd Acu
```

that's it. you now have the framework on your machine.

## step 2: open it

**if you're using VS Code:**
- File → Open Folder → select the `Acu` folder you just cloned
- open the Claude Code panel (it should appear in your sidebar after installing the extension)

**if you're using Claude Desktop:**
- open the app, it should detect the folder or you can point it to the `Acu` directory

**if you're using the CLI:**
- just make sure you're in the `Acu` directory and type `claude`

the important thing is that Claude Code is running inside the Acu folder. it reads the `CLAUDE.md` files in the directory structure and those files tell it how to behave. if you're not in the right folder it won't know what Acu is.

## step 3: create your first pipeline

type this into Claude Code:

```
/acu-new
```

that's a slash command. it triggers the pipeline generator. the generator asks you questions about what you want to build:

- what is this pipeline for?
- what are the stages?
- what does "done" look like?
- any tools or resources?
- what standards apply?
- what should never happen?
- what do you call a single run?

you can answer these however you want. here's a simple example:

> "i want a pipeline called BookReview for reading books and writing reviews. stages are Select, Read, Draft, Edit, Publish. the final output is a published review in markdown. no automated tooling, it's all manual. reviews should have no spoilers in the summary and quotes should be real. never publish without finishing the book. a single run is called a review, operated by a reviewer."

\* this is a perfect example. don't be scared if you're missing information, Acu will prompt you for more.

the generator shows you the proposed design. confirm it and it builds everything — directories, gate scripts, templates, the works.

## step 4: start a work unit

now you have a pipeline. to actually use it, type:

```
/acu-start
```

this creates a new work unit inside your pipeline. it asks you a few targeted questions (name, description, target date) and creates a directory with your answers filled in:

```
reviews/001-dune/
├── intake.yaml    # what you're working on
└── status.yaml    # where it is in the pipeline
```

## step 5: do the work

tell Claude Code something like:

> "work on book review 001-dune"

it figures out which pipeline you're in, reads `status.yaml` to see what stage you're on, loads that stage's instructions, and starts working. the AI's behavior changes at each stage because each stage has different instructions.

## step 6: advance through gates

when a stage is done, run the gate to advance:

```bash
bash gates/advance.sh reviews/001-dune/ select-to-read
```

the gate checks if the work meets requirements. if it passes, `status.yaml` advances to the next stage and the transition gets logged. if it fails, it tells you what's missing and you fix it.

keep working through stages and passing gates until the pipeline is complete.

## step 7: there's no step 7

that's it. you just ran an AI-orchestrated pipeline. the directory structure was the program and the AI was the runtime. no code, no configuration files, no orchestration logic. just folders with instructions and bash scripts that check the output.

## other useful commands

once you're comfortable with the basics:

| command | what it does |
|---------|-------------|
| `/acu-check` | scans your pipelines for structural problems |
| `/acu-observe` | framework-wide health snapshot |
| `/acu-pulse` | pipeline metrics (gate pass rates, cycle times) |
| `/acu-update` | brings pipelines up to the latest template version |
| `/acu-brainstorm` | stress-test an idea before building it |
| `/acu-research` | structured research with source citations |
| `/acu-learn` | learn a topic through the framework's study pipeline |
| `/acu-eval` | run semantic quality evaluation on stage output |

## if something breaks

- **gate fails** — read the output. it tells you exactly what check failed and what's missing. fix it and run the gate again.
- **AI seems confused** — make sure you're in the right directory. Claude Code reads `CLAUDE.md` from the current context. wrong folder = wrong instructions.
- **"command not found"** — make sure you have bash available. on Windows, Git Bash works. WSL works. the gates are shell scripts.
- **want to start over** — delete the work unit directory and create a new one with `/acu-start`. pipelines are reusable, work units are disposable.

## want to dig deeper

- [README.md](README.md) — technical architecture, evaluation hierarchy, parallel execution
- [THREAT-MODEL.md](THREAT-MODEL.md) — security posture and attack surfaces
- break something on purpose. edit a gate to be stricter. change a `CLAUDE.md` constraint. see how the AI's behavior changes. the best way to understand the system is to push it.

if you have questions or feedback hit me up at delted@delted.dev. all feedback is welcome, especially the "this doesn't work" kind.
