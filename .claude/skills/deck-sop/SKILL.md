---
name: deck-sop
description: Token-efficient SOP for building PowerPoint decks, pitch decks, and presentations in the HiveMinds house format (dark-green sidebar rail, cream canvas, gold accents, Calibri). Use this skill ANY time the user wants to create, edit, or modify a slide deck, .pptx file, pitch deck, or PowerPoint — even if they don't mention "SOP", "HiveMinds", or "format". Loads the locked-in brand format by default so the user never has to re-paste colours, fonts, or layout. Covers the 5 core slide patterns (snapshot, stacked-bar + donut callouts, stat cards + dual chart, donut + table, data table + insight panel), chart-type rules, the 5-part slide prompt formula, QA checklist, and multi-session continuity. Activate whenever any deck work comes up so the user gets repeatable, on-brand output the first time without back-and-forth rework.
---

# Deck SOP — HiveMinds Format (Default)

This skill produces on-brand HiveMinds decks with minimum tokens and minimum rework. The brand format is **locked in as the default** — the user does not re-paste colours, fonts, or layout each session. They describe slides in plain English; this skill handles the rest.

---

## STEP 1 — Activation Handshake (do this FIRST)

When this skill triggers, before doing any deck work, confirm **once**:

> "Using the HiveMinds default format (dark-green rail, cream canvas, gold accents, Calibri). Same as before, or paste a different format block?"

- **No reply / "same"** → use the default format below for the rest of the conversation. Don't ask again.
- **User pastes a format block** → use their format instead and ignore the default.
- **Running headless / non-interactively** (e.g. invoked as a one-shot CLI prompt with no way to reply) → skip the question and use the default format silently.

Skip the handshake for trivial questions ("what font should a title be?"). Only confirm when actual deck building is happening.

---

## STEP 2 — The Locked-In Default Format

If the user has not pasted a different format, use this exactly:

**Slide dimensions:** 16:9 widescreen, 13.333" × 7.5" (LAYOUT_WIDE)

**Colour palette (all overridable if user pastes different hexes):**
| Role | Hex | Used for |
|---|---|---|
| Primary dark green | `#13352B` | Left sidebar rail, slide titles, dark chart bars, dark callout circles |
| Cream canvas | `#F7F4EF` | Main slide background |
| Gold accent | `#C8A028` | Subtitle italic, stat-card top strip, gold chart bars, accent borders |
| Sidebar heading | `#493000` | "CHANNELS", "KEY COMPETITORS" style headings inside the rail |
| Indigo blue | `#3B4CA6` | Branded segment in stacked bars, secondary chart fills |
| White card | `#FFFFFF` | Stat cards, chart panel backgrounds |
| Light gray | `#E8E4DC` | Card borders, subtle dividers |

**Typography (Calibri throughout):**
| Element | Size | Weight | Colour |
|---|---|---|---|
| Slide title | 28-32pt | Bold | `#13352B` |
| Subtitle (under title) | 14-16pt | Italic | `#C8A028` |
| Sidebar vertical category label | 22-26pt | Bold | `#FFFFFF` |
| Sidebar small heading (e.g. CHANNELS) | 11-12pt | Bold | `#493000` (or gold on dark = `#C8A028`) |
| Sidebar bullet | 11pt | Regular | `#FFFFFF` |
| Stat card big number | 36-44pt | Bold | `#13352B` |
| Stat card label | 11-12pt | Regular | `#13352B` |
| Body text | 11-12pt | Regular | `#13352B` |
| Source citation (sidebar bottom) | 9pt | Bold | `#FFFFFF` |

**Standard layout (every content slide):**
- **Left sidebar rail:** ~2" wide, full height, fill `#13352B`. Contains:
  - Vertical category label (e.g. "INDUSTRY LANDSCAPE", "DIGITAL LANDSCAPE BY PLATFORM"), white bold, left-aligned, vertically positioned ~35-50% down
  - Optional sidebar lists (CHANNELS / KEY COMPETITORS) for snapshot slides only
  - Source citation at bottom-left in white bold 9pt
- **Main canvas:** rest of the slide, fill `#F7F4EF`. Contains title, subtitle, and content blocks
- **Top-right:** ~1.2" × 0.8" placeholder rectangle for client logo (leave empty white box with light border — user adds logo in PowerPoint)
- **Bottom-right:** ~1.2" × 0.5" placeholder rectangle for HiveMinds logo (same — user adds in PowerPoint)
- **Title:** top of canvas, ~28-32pt bold dark green
- **Subtitle:** directly under title, italic gold 14-16pt

**Tool:** `pptxgenjs` (Node.js) for all slide builds. Reasons in `references/sop-full.md`.

---

## STEP 3 — The 5-Part Slide Prompt

Every slide build follows this structure. If the user's request is missing parts, ask **once** for everything missing in a single message — never piecemeal.

1. **WHAT IT IS** — slide type and title
2. **THE DATA** — all numbers, labels, categories exactly as they should appear
3. **THE CHARTS** — chart type, what's on which axis, what the legend says
4. **THE LAYOUT** — which of the 5 standard patterns (or custom)
5. **SPECIAL RULES** — anything different from the standard format

If the user uploads an image of data, **type the numbers back into the prompt** before building. Reading numbers off images is imprecise and causes rework.

---

## STEP 4 — Pick a Slide Pattern

Five patterns are pre-built and ready. Match the user's data shape to a pattern, then load `references/slide-patterns.md` for the exact layout coordinates and pptxgenjs code skeleton.

| Pattern | When to use | Reference |
|---|---|---|
| **P1 — Snapshot / Brief** | 3 stat cards in a row + 1-2 supporting blocks below (roadmap text, mini bar chart). Used for executive briefs, current-state snapshots. | `references/slide-patterns.md#p1` |
| **P2 — Stacked bar + donut callouts** | Showing a split (branded vs non-branded, organised vs unorganised) with a stacked bar and circular percentage callouts on the right. | `references/slide-patterns.md#p2` |
| **P3 — Stat cards + dual chart** | 3 stat cards across the top + 2 charts side-by-side below (e.g. volume growth bars + horizontal channel split). | `references/slide-patterns.md#p3` |
| **P4 — Donut + table combo** | Donut chart on the left with category list, comparison table on the right (platform sizing, channel performance). | `references/slide-patterns.md#p4` |
| **P5 — Data table + insight panel** | Wide data table on the left (brand-by-platform SKU counts) + narrow insight/recommendation panel on the right with coloured callout boxes. | `references/slide-patterns.md#p5` |

If the data doesn't fit any pattern, build custom but keep the sidebar rail, title style, and palette identical.

---

## Core Rules (always apply when activated)

**Tool choice:**
- Use `pptxgenjs` (Node.js) for slides with charts, icons, custom layouts
- Use XML editing (unpack/repack) only for tiny text changes to existing .pptx files
- Never mix tools in one session

**Charts — always specify explicitly:**
- Direction: "horizontal bar" or "vertical clustered bar" — never just "bar chart"
- Data labels: "inside bar white text", "outside bar dark text", or "no labels"
- Sorting: "sorted highest to lowest" unless category order matters
- Colours: pull from the locked palette — gold `#C8A028` for primary, dark green `#13352B` for secondary, indigo `#3B4CA6` for tertiary
- See `references/chart-cheatsheet.md` for full mapping

**Logos:**
- Always leave white placeholder rectangles top-right (client logo, ~1.2"×0.8") and bottom-right (HiveMinds logo, ~1.2"×0.5")
- Never embed logos — user adds them in PowerPoint after delivery
- Add a 1pt light gray border (`#E8E4DC`) so the placeholder is visible but not distracting

**The LibreOffice chart bug:**
If editing existing .pptx XML and adding more data rows than originally existed, LibreOffice's PDF renderer crops the slide. The .pptx is fine in PowerPoint but previews look broken. **Fix:** rebuild the slide from scratch using `pptxgenjs` native charts instead of editing XML.

**Batch edits:**
When the user requests changes, wait for them to list all changes in **one** message before re-rendering. Each render is expensive. If they send "change X" then "also change Y", remind them once: "Want to batch any other changes? Each render rebuilds the whole file."

**QA before delivery:**
After building each slide, render a preview and run this checklist:
- All values exactly as given?
- Sidebar rail dark green `#13352B`, canvas cream `#F7F4EF`?
- Title dark green bold, subtitle gold italic?
- Logo placeholders present top-right and bottom-right?
- Source citation at bottom-left of sidebar?
- Charts use locked palette colours, correct direction, labels as specified?

Then ask: "Preview look right? Say 'deliver' or 'fix: [issue]'."

---

## Token-Saving Reflexes

- **Never re-explain the format.** It's locked in. If the user says "build slide N", just build it.
- Treat "use my format" or "same as before" as the locked default.
- Treat "continue" as "resume from where we left off, same format, same conventions".
- For a list of N changes, do all N in one rebuild.
- Don't auto-add labels, titles, or annotations the user didn't ask for — they cost a re-render to remove.
- Don't narrate intermediate steps ("Now I'll add the chart…"). Build silently, show preview, ask for feedback.

---

## Multi-Session Continuity

When the user says "make a summary I can use to continue in next chat" (or similar), output a compact block containing:
- The format block (or "default HiveMinds format" if unchanged)
- Slides built so far (titles + brief content note each)
- Data sources and key numbers used
- Tool choice and any technical notes (LibreOffice bug encountered, custom chart configs, etc.)
- The next planned slide if known

The user pastes this into the next chat to resume.

---

## Reference Files

Load on demand — don't read upfront unless needed.

- `references/slide-patterns.md` — Exact pptxgenjs code skeletons for the 5 standard slide patterns
- `references/chart-cheatsheet.md` — Chart-type rules, prompt patterns, common pitfalls
- `references/sop-full.md` — Full SOP rationale, tool choice reasoning, rework log

---

## Output Workflow (standalone agent / local environment)

This copy of the skill is bundled for use outside Claude.ai — e.g. via the `deck-agent` CLI in this repo, or any Claude Agent SDK host. Adjust the delivery paths accordingly:

1. Confirm format (handshake, or skip if headless) → 2. Get the 5-part slide prompt → 3. Pick pattern → 4. Build with pptxgenjs in a scratch working directory (e.g. `./output/.build/`) → 5. Run `npm install pptxgenjs` once per project if not already installed, then `node <script>.js` to write the `.pptx` → 6. If `soffice` (LibreOffice) and `pdftoppm` are available on the machine, render a preview (`soffice --headless --convert-to pdf` then `pdftoppm -jpeg`) and view the slide images; if they're not installed, skip the visual preview and rely on the text QA checklist below → 7. Self-check QA → 8. Move/copy the final `.pptx` into `./output/` → 9. Tell the user the final path.

Build, don't narrate. Minimise prose between tool calls.
