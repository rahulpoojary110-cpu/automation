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

## Windows: one-click app

For Windows, skip the CLI setup below entirely:

1. Install [Node.js](https://nodejs.org) (LTS) if you don't already have it —
   this is what actually runs the generated deck-building code, so it's
   needed either way.
2. Download this project folder and double-click **`run.bat`**.
3. First launch installs dependencies automatically (~1 minute, one time
   only). It then asks you to paste your Anthropic API key once — it's saved
   to `%USERPROFILE%\.deck-sop-agent\config.json` so you're never asked
   again.
4. From then on, just type what deck you want at the `Build a deck >`
   prompt. Finished files land in `%USERPROFILE%\deck-sop-agent\output\`.

No manual `npm install`, no editing `.env` by hand — `run.bat` does both for
you the first time, then it behaves like a normal desktop app: double-click,
type your request, get a file back.

*(A fully self-contained single `.exe` with no Node.js requirement is
possible via `bun build --compile`, but it bundles Anthropic's full Claude
Code CLI binary and comes out to ~365MB — too large to hand over here. See
"Building a single-file .exe" below if you want to build that yourself.)*

## Setup (CLI, any OS)

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
- `src/build-deck.mjs` — a one-shot CLI: `npm run build-deck -- "<prompt>"`,
  no interactive prompts, good for scripting/automation.
- `src/app-core.mjs` — the interactive "app" loop (first-run API-key wizard,
  saved config, `Build a deck >` prompt loop) shared by both desktop entry
  points below.
- `src/app.mjs` — plain Node.js entry point used by `run.bat`; reads the
  skill files off disk and lets the SDK auto-resolve its own native `claude`
  binary via `npm install`.
- `src/app.win32.mjs` — entry point for the single-file Windows `.exe` build
  (see below); statically embeds the skill files and the win32 `claude`
  binary into the bundle.

All three call the same Claude Agent SDK `query()`, enabling only the
`deck-sop` skill and the tools it needs (Bash, Read, Write, Edit, Glob,
Grep).

Because it runs headless with `permissionMode: 'bypassPermissions'`, the
agent executes shell commands (npm, node, soffice) without prompting for
approval each time — that's what makes it usable as a one-shot CLI instead
of an interactive chat. Only run it against prompts you trust, the same way
you'd treat any automation with shell access.

## Building a single-file .exe (no Node.js required on the target machine)

Requires [Bun](https://bun.sh) on the *build* machine (Bun can cross-compile
Windows binaries from Linux/macOS — the target machine doesn't need Bun):

```bash
npm install @anthropic-ai/claude-agent-sdk-win32-x64 --force  # fetches the native win32 claude.exe asset
bun build --compile --target=bun-windows-x64 src/app.win32.mjs \
  --outfile deck-sop-agent-windows.exe
```

The result is one ~365MB `.exe` (mostly Anthropic's own Claude Code CLI
binary, embedded so nothing else needs installing) with the same first-run
API-key wizard. Not committed to this repo or distributed here because of
its size — build it yourself if you want a true zero-dependency binary.

## Sharing this with others

Anyone can clone this repo, add their own `ANTHROPIC_API_KEY`, and run the
same command — the skill and agent code are self-contained, nothing here
depends on your personal Claude Code setup.
