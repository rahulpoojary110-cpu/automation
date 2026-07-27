# Full SOP — Rationale & Rework Log

## Why This Skill Exists

Each deck rebuild used to cost ~20-40k tokens of back-and-forth: re-pasting brand colours, explaining sidebar layout, fixing chart directions, adjusting data labels. This skill cuts that to near-zero by:
1. Locking the format as the default (no re-paste needed)
2. Pre-baking the 5 most-used slide patterns with exact coordinates
3. Specifying a strict 5-part slide prompt so nothing's ambiguous
4. Forcing pptxgenjs (no XML editing for new builds — see LibreOffice bug below)

## Why pptxgenjs Over python-pptx or XML Editing

- **pptxgenjs** is the cleanest API for charts + custom shapes. Coordinates in inches map 1:1 to the layout.
- **python-pptx** has weaker chart support and awkward shape-positioning.
- **XML editing (unpack/repack)** is fine for tiny text changes to existing decks, but adding charts via XML triggers the LibreOffice rendering bug (see below).

**Rule:** New build → pptxgenjs. Tiny text fix to an existing deck the user uploaded → XML edit. Never both in one session.

## The LibreOffice Chart Bug

If you edit an existing .pptx XML and add more chart data rows than originally existed, LibreOffice's PDF export crops the slide rendering. The .pptx opens fine in PowerPoint but our preview pipeline (.pptx → PDF → JPG via soffice + pdftoppm) shows a broken slide.

**Symptoms:**
- Preview JPG shows clipped chart
- Right side of slide truncated
- Bottom of slide cut off

**Fix:** Don't edit XML. Rebuild the slide with pptxgenjs from scratch using `pres.ChartType.bar` (or whatever native type). The native chart embeds correctly.

## Why Logos Are Placeholders, Not Embedded

Brand logos change per client. Embedding them via pptxgenjs `addImage` requires:
- The image file accessible at build time
- Correct sizing per logo aspect ratio
- A re-render every time the client changes

Placeholder rectangles let the user paste the right logo in PowerPoint in 5 seconds without rebuilding. The placeholder is white-filled with a 1pt light-gray border (`#E8E4DC`) so it's visible but doesn't distract. Two placeholders standard:
- Top-right: client logo (~1.2" × 0.8")
- Bottom-right: HiveMinds logo (~1.2" × 0.5")

## Rework Log (lessons baked into the skill)

### "Just say bar chart"
Saying "bar chart" without specifying `barDir` defaults to horizontal in some libs and vertical in others. Always specify direction. Now codified in `chart-cheatsheet.md`.

### "Centre label doesn't show in donut"
Donut centre labels must be a separate text box positioned over the chart's centre. They're NOT a property of the chart object. P4 pattern shows the correct approach.

### "Stat card numbers wrap to two lines"
Big numbers like "13.68M MT" need a card width of at least 3.0" at 26pt. If the card is narrower, the number wraps. Default card width in P3 is 3.3" for safety.

### "Sidebar text overlaps with sidebar bullets"
On P1 (snapshot), the sidebar has CHANNELS / KEY COMPETITORS lists AND the vertical category label. The category label must be positioned ABOVE the lists (`y: 0.5-1.2`) or BELOW them (`y: 5.5+`), not in the middle. P1 in `slide-patterns.md` puts the category label at the top of the rail when lists are present.

### "Source citation gets cropped"
The source citation at sidebar bottom must be at `y: 6.9` max with `h: 0.5` — the slide is 7.5" tall. Going lower gets clipped on some renderers.

### "User keeps re-pasting the format block"
Old version of this skill asked for the format block every conversation. New version: format is locked in as the default; only ask if the user's first message contains a different format.

## Self-Verification Loop (run after every render)

1. `extract-text output.pptx` → check all values exact, no placeholder text leaked
2. `extract-text output.pptx | grep -iE "\bx{3,}\b|lorem|ipsum|TODO|\[insert"` → must return empty
3. Convert to JPG and view → look for: overflow, overlap, missing logos, wrong colours
4. If any issue: fix, re-render, re-verify ONCE. Don't loop on sub-pixel nudges.

## Multi-Session Continuity Format

When the user asks for a continuity summary, output exactly this structure:

```
=== DECK CONTINUITY BLOCK ===
Format: HiveMinds default (or paste custom block here)

Slides built:
1. [Title] — [P-pattern] — [brief content note]
2. [Title] — [P-pattern] — [brief content note]
...

Data sources:
- [Source 1]
- [Source 2]

Key numbers:
- [Number 1: context]
- [Number 2: context]

Tool: pptxgenjs
Technical notes: [any bugs hit, custom configs]

Next planned: [Slide topic, if known]
=== END BLOCK ===
```

The user pastes this into a new chat to resume.
