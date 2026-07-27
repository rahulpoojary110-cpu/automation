# deck-sop-agent

A standalone AI agent that builds PowerPoint decks in the HiveMinds house
format (dark-green sidebar rail, cream canvas, gold accents, Calibri) from a
plain-English description. It's a small CLI wrapper around the
[Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview)
that loads the bundled `deck-sop` skill, so anyone with an Anthropic API key
can run it — no Claude Code subscription or pre-installed skill required.

## What it does

You describe a slide (or several), and the agent:
1. Picks one of the 5 pre-built HiveMinds slide patterns (or builds custom)
2. Writes a `pptxgenjs` script and runs it to generate the `.pptx`
3. Renders a preview if LibreOffice (`soffice` + `pdftoppm`) is installed
4. Runs the skill's QA checklist
5. Saves the finished deck to `./output/`

The brand format (colours, fonts, layout, logo placeholders) is locked into
the skill, so you never have to re-paste it — just describe the content.

## Setup

```bash
npm install
cp .env.example .env   # then paste your ANTHROPIC_API_KEY into .env
```

Optional, for visual QA previews (not required to generate the `.pptx`):

```bash
# Debian/Ubuntu
sudo apt-get install libreoffice poppler-utils
```

## Usage

```bash
npm run build-deck -- "Build a P1 snapshot slide titled 'Q3 Launch Brief'.
Stat cards: ₹50L Monthly Media Spend, 2.5x Current ROAS, 100 MT Quarterly
Volume. Roadmap card: 100 MT to 800 MT, 8x scale target per quarter.
Source: internal dashboard, July 2026."
```

Or directly:

```bash
node src/build-deck.mjs "<slide description>"
```

Follow the skill's [5-part slide prompt](.claude/skills/deck-sop/SKILL.md#step-3--the-5-part-slide-prompt)
for best results: what it is, the data, the charts, the layout pattern, and
any special rules. The agent will ask (in its output) for anything missing.

### Options

```
--format <file>     Use a custom format block instead of the locked-in
                     HiveMinds default for this run (colours/fonts/layout)
--max-turns <n>     Max agentic turns before stopping (default: 60)
--model <name>      Model alias or id
```

### Output

Finished `.pptx` files land in `./output/`.

## How it's built

- `.claude/skills/deck-sop/` — the deck-sop skill (SOP, slide patterns,
  chart cheat sheet), bundled into the repo so it travels with the agent
  instead of depending on a personal Claude Code skills install.
- `src/build-deck.mjs` — a CLI that calls the Claude Agent SDK's `query()`,
  enabling only the `deck-sop` skill and the tools it needs (Bash, Read,
  Write, Edit, Glob, Grep), and streams the agent's progress to your
  terminal.

Because it runs headless with `permissionMode: 'bypassPermissions'`, the
agent executes shell commands (npm, node, soffice) without prompting for
approval each time — that's what makes it usable as a one-shot CLI instead
of an interactive chat. Only run it against prompts you trust, the same way
you'd treat any automation with shell access.

## Sharing this with others

Anyone can clone this repo, add their own `ANTHROPIC_API_KEY`, and run the
same command — the skill and agent code are self-contained, nothing here
depends on your personal Claude Code setup.
