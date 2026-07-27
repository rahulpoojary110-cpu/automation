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

## Static version: free-hosted like any HTML page (recommended)

`docs/index.html` is a completely different, simpler build: no server, no
Node.js, no build step, nothing that can fail to build. It's one HTML file
plus one vendored JS file (`docs/pptxgen.bundle.js`) that runs entirely in
your browser tab:

- You paste a free **Google Gemini** API key into the page (saved in your
  browser's local storage only) — this version uses Gemini rather than
  Claude specifically so it can run on Gemini's genuinely free tier
  (no billing/credit card), since Anthropic's API has no free tier.
- The page calls the Gemini API **directly from your browser**
  (`generativelanguage.googleapis.com`) and asks it to write a `pptxgenjs`
  script following the deck-sop format.
- That script runs immediately in your browser tab using the vendored
  `pptxgenjs` library, and triggers a normal file download for the `.pptx`.

There is no backend at all, so there's nothing to deploy wrong — this is
the option to use after the Render/Railway build failures, since a static
host either serves the files or it doesn't; there's no build pipeline to
break.

**Get a free API key:** go to [aistudio.google.com](https://aistudio.google.com/apikey),
sign in with any Google account, create a key — no credit card required.
The free tier (as of this writing, `gemini-2.5-flash`) has a modest daily
request limit, which is plenty for building decks one at a time.
Google renames/retires model ids fairly often; the page has a **Model**
field (defaults to `gemini-2.5-flash`) you can edit directly if the default
ever stops working — check aistudio.google.com for the current free-tier
flash model name.

**Host it for free with GitHub Pages (2 minutes, no new account needed —
uses the GitHub account this repo is already on):**

1. On GitHub, open this repo → **Settings** → **Pages** (left sidebar,
   under "Code and automation").
2. Under **Build and deployment** → **Source**, choose **Deploy from a
   branch**.
3. Under **Branch**, pick this branch (`claude/ai-agent-deck-sop-mfqvqf`, or
   `main` after merging) and folder **`/docs`**, then **Save**.
4. GitHub shows a URL at the top of that same Pages settings page once it's
   live, like `https://rahulpoojary110-cpu.github.io/automation/` — usually
   ready within a minute. Bookmark it.
5. Open the URL, paste your API key, describe your deck, click **Build
   deck** — the `.pptx` downloads straight to your device.

**What's different from the CLI/web-server versions:** this version can't
run shell commands, so it can't render a visual preview image the way the
Node-based skill workflow does (no LibreOffice step) — you just get the
`.pptx` directly and open it in PowerPoint to check it. It also can't do
things outside pure pptxgenjs code (no arbitrary file/shell access), which
in practice doesn't matter for building decks — it's the same 5 patterns
and the same locked format, just generated and run client-side instead of
server-side.

**Cost/security note:** each visitor uses their *own* pasted key for their
*own* requests — there's no shared server, so no shared bill and no
password gate needed. Anyone who opens the URL can use the page, but only
with a key they provide themselves.

**Quality note:** the free-tier flash models are small and fast — they
follow the format instructions well for straightforward slides, but are
less consistent than Claude on complex/unusual layouts. If a build comes
out wrong, rephrasing the request or just clicking **Build deck** again
often fixes it. One slide at a time is the most reliable.

### The three modes

**Build a new deck** — describe slides in plain English, get a `.pptx`.

**Reformat an existing deck** — upload a `.pptx` you already have and get
it back restyled into the HiveMinds format, with the data left alone:

- The file is unzipped and parsed **in your browser tab** (a `.pptx` is a
  zip; the page uses the JSZip copy already bundled inside
  `pptxgen.bundle.js`). The file itself is never uploaded anywhere — only
  the extracted text, table cells and chart values are sent to the model
  so it can lay them out.
- Slide text, table structure, and chart data (type, categories, series
  names, series values) are extracted per slide. **Preview extracted
  data** shows you exactly what will be sent before you send it.
- The model is instructed to reproduce every value character-for-character
  and to keep slide count and order — it may only change colours, fonts,
  sizes, positions and which layout pattern the content sits in.
- Anything that *should* change but would alter your content (too many
  bullets, a chart type that misrepresents the data, a missing source
  citation, inconsistent units) is returned as a **suggestion** in a
  separate panel rather than being silently applied.

Charts are re-created as native pptxgenjs charts from the extracted
values, so they stay editable. Images, speaker notes, animations and
custom shapes in the source deck are **not** carried over — this reads
content, not pixel-perfect structure.

**Update numbers** — refresh last period's deck with this period's figures,
keeping the original design completely intact. Unlike *Reformat*, this does
not regenerate anything: it opens your `.pptx` (a zip), patches only the
text nodes whose numbers you changed, and re-zips. Every font, colour,
image, animation, master and layout survives byte-for-byte; slides you
don't touch stay byte-identical.

- **Scan for numbers** lists every number it finds, grouped by slide, with
  the surrounding text as context and a type tag (currency, percentage,
  number, negative in parens, chart value).
- Type new values next to the ones you want changed. **Formatting is
  reapplied from the original**, so entering `41` against `30%` yields
  `41%`, against `1,234` yields `5,678` (commas kept), against `$1,234.56`
  yields `$9,876.50` (symbol and 2dp kept), and against `(123)` yields
  `(45)` (parentheses kept).
- Chart series values are patched in the chart XML, so charts stay native
  and editable.
- **Export JSON** / **Import JSON** give the same fill-in-a-template
  workflow as a script — export, edit in bulk, re-import.
- **Fill with AI** (optional) takes a paste of this period's figures and
  maps them onto the existing numbers for you. Only the number list and
  your pasted text are sent — never the file. Review before applying.

Known limitation: PowerPoint sometimes splits a single number across
multiple text runs (e.g. `1,` + `234` when part of it was edited
separately). Numbers split that way aren't detected, since each run is
scanned independently — that tradeoff is deliberate, because merging runs
to catch them would discard the per-run formatting this mode exists to
preserve.

## Run it as a website with a backend (alternative — has more moving parts)

If you specifically want the fuller agent (real shell access, visual
previews, multi-file output) rather than the static version above, deploy
the bundled web UI (`server/index.mjs` + `public/index.html`) to a free
host. This runs Node.js on the host's server, not your machine — you only
need a browser to use it, but there's a real build/deploy step involved,
which is what failed on Render and Railway.

**Deploy to Railway (free trial credit), entirely through your browser.**
Railway builds this repo using the included `Dockerfile`, which sidesteps
platform auto-detection guesswork entirely:

1. Push/fork this repo to your own GitHub account (already done if you're
   working from this branch).
2. Go to [railway.com](https://railway.com) → **Login** with GitHub.
3. **New Project** → **Deploy from GitHub repo** → authorize Railway to see
   your repos if asked → pick `automation` (this repo).
4. Railway finds the `Dockerfile` and builds automatically — no build/start
   command to configure. Watch the **Deployments** tab; wait for it to say
   "Success".
5. **This step is easy to miss and is why a Railway deploy can look "not
   running" even after a successful build:** open the service → **Settings**
   → **Networking** → click **Generate Domain**. Railway does not expose a
   public URL by default. This gives you one like
   `https://automation-production-xxxx.up.railway.app`.
6. Still in **Settings**, go to **Variables** → add `SITE_PASSWORD` set to a
   password of your choosing. This gates *usage* (not just page load) —
   skipping it means anyone who finds the URL can run the agent, which
   executes shell commands on your server, so set one before sharing the
   link. Adding a variable triggers a redeploy — wait for it to finish.
7. Open the domain from step 5, enter the site password, paste your
   Anthropic API key (stays in your browser's local storage, sent per
   request, never stored server-side), describe your deck, and click
   **Build deck**. Watch it work in the log panel; download the `.pptx` when
   it finishes.

Render, Fly.io, and other Node-hosting PaaS work the same way in principle
(`npm install` + `npm run web`, or the `Dockerfile`, plus a writable
filesystem for generated files) — `render.yaml` is still in this repo if you
want to try Render instead. The two most common "deployed but nothing
happens" causes on any of these platforms are (a) no public domain/URL was
generated — some platforms require an explicit step for this, as in Railway
step 5 above — and (b) the build used a different command than
`npm run web` / the Dockerfile. Check the platform's deploy logs first; they
usually say directly which of the two it is.

**Troubleshooting: "agent process ended without completing a turn" /
permission errors mentioning root.** The Claude Agent SDK refuses to run
with permissions bypassed (required for this to work unattended) when the
process is running as the root user, as a safety guard. Render's native
Node runtime and most buildpack-style hosts already run your app as
non-root, so this shouldn't come up there — but a plain `docker run` (or
any host that defaults containers to root) will hit it. The included
`Dockerfile` sets a non-root user specifically to avoid this; use it if
you're deploying via Docker anywhere.

**Note on cost/security:** every build call spends *your* pasted API key's
credits and runs real shell commands (`npm`, `node`, optionally `soffice`)
in the server's container. That's what makes it capable of writing and
running the `pptxgenjs` script — but it's also why the password gate exists.
Don't share the URL+password with anyone you wouldn't hand shell access to.

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
- `server/index.mjs` + `public/index.html` — the hosted web version: an
  Express server exposing a streaming `/api/build` endpoint (Server-Sent
  Events) and a single-page browser UI, for the "website with a backend"
  option above.
- `docs/index.html` + `docs/pptxgen.bundle.js` — the static, no-backend
  version for GitHub Pages. Architecturally different from everything else
  here: no Claude Agent SDK, no Bash tool, no server, and no Anthropic API
  either — it calls Google's Gemini API directly from the browser (chosen
  specifically for its free tier) and asks for a `pptxgenjs` script as the
  entire response, then runs that script
  client-side against the vendored browser build of `pptxgenjs`
  (`node_modules/pptxgenjs/dist/pptxgen.bundle.js`, copied in — note it's
  specifically the `.bundle.js` build, not `.min.js`, because only the
  bundle inlines JSZip; `pptxgenjs` depends on it and the minified build
  expects it as a separate global that isn't there).

The CLI/desktop/server versions all call the Claude Agent SDK's `query()`,
enabling only the `deck-sop` skill and the tools it needs (Bash, Read,
Write, Edit, Glob, Grep). Because they run headless with
`permissionMode: 'bypassPermissions'`, the agent executes shell commands
(npm, node, soffice) without prompting for approval each time — that's what
makes them usable as one-shot tools instead of an interactive chat. Only
run them against prompts you trust, the same way you'd treat any automation
with shell access. The static GitHub Pages version has no shell access at
all — the only code that runs is the pptxgenjs script Claude writes,
executed in your own browser tab.

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
