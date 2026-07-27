# Chart Cheat Sheet — pptxgenjs

Locked palette colours used throughout: green `#13352B`, gold `#C8A028`, indigo `#3B4CA6`, cream `#F7F4EF`, white `#FFFFFF`.

## Chart-type Decision Rules

| User says… | Use | Notes |
|---|---|---|
| "bar chart" with categories on Y-axis | `barDir: 'bar'` (horizontal) | Default for ranking-style data |
| "column chart" / time-series | `barDir: 'col'` (vertical) | Default for over-time data |
| "stacked bar" / "split breakdown" | `barDir: 'col', barGrouping: 'stacked'` | Two-segment splits like branded vs non-branded |
| "donut" / "pie with hole" | `pres.ChartType.doughnut, holeSize: 60` | Always include centre label as a separate text box |
| "pie" | `pres.ChartType.pie` | Avoid unless user asks — donut reads better |
| "line" / "trend" | `pres.ChartType.line` | Set `chartColors: [C.green, C.gold]` |

## Always-Specify Properties

For every chart, set these explicitly — defaults are ugly:

```js
{
  // Colours from locked palette
  chartColors: [C.green, C.gold, C.indigo],

  // Fonts
  catAxisLabelFontFace: 'Calibri',
  catAxisLabelFontSize: 11,
  catAxisLabelColor: '13352B',
  valAxisLabelFontFace: 'Calibri',
  valAxisLabelFontSize: 10,

  // Data labels
  showValue: true,
  dataLabelColor: 'FFFFFF',           // or '13352B' if outside bar
  dataLabelFontFace: 'Calibri',
  dataLabelFontSize: 11,
  dataLabelFontBold: true,
  dataLabelFormatCode: '0"%"',         // or '0.0', '#,##0', '"₹"#,##0' as needed

  // Legend (off by default; on only if the chart has 2+ series)
  showLegend: false,
  legendPos: 't',
  legendFontFace: 'Calibri',
  legendFontSize: 11,

  // Hide axis lines for clean look
  valAxisHidden: true,
}
```

## Data Label Placement

- **Inside bar (white text):** for stacked bars and dark-coloured bars where the segment is wide enough. Use `dataLabelColor: 'FFFFFF'`, `dataLabelFontBold: true`.
- **Outside bar (dark text):** for vertical bars where the value goes above the column. Use `dataLabelColor: '13352B'`, `dataLabelPosition: 'outEnd'`.
- **No labels:** when the chart is a callout next to a giant number — the giant number is the headline; chart is just visual context.

## Common Pitfalls

**Donuts:**
- Always set `holeSize: 60` minimum, or it looks like a pie chart.
- The centre label is NOT part of the chart. Add it as a separate `addText` block centred on the chart's coordinates.
- Use a custom legend with manual ellipse markers (see P4 in `slide-patterns.md`) — pptxgenjs's auto legend wraps awkwardly.

**Stacked bars:**
- Order matters: the FIRST series in the data array goes on the bottom of the stack. Put the larger / "base" segment first (e.g. Non-Branded before Branded).
- Set `barGrouping: 'stacked'` AND `barDir: 'col'` — missing either breaks the layout.

**Horizontal bars:**
- Categories appear bottom-to-top (last in array = top of chart). Reverse the array if you want top-down ranking.
- Set `valAxisHidden: true` and let data labels do the talking.

**Y-axis grid lines:**
- pptxgenjs adds horizontal grid lines by default. Suppress with `valGridLine: { style: 'none' }` for a cleaner card look.

## Colour Assignment by Series Count

- 1 series → `[C.green]`
- 2 series → `[C.gold, C.indigo]` (gold base, indigo accent for stacked); `[C.green, C.gold]` for comparison
- 3 series → `[C.green, C.gold, C.indigo]`
- 4+ series → mix in the donut palette: `['F0AE24', 'B07CC6', 'EE3F8E', 'EC5B2C', '3B4CA6', 'A6A6A6']` (gold, lavender, magenta, orange, indigo, gray) — used in P4

## Source Citation Rule

Every chart slide must have a source citation. It goes in the **sidebar bottom-left**, NOT under the chart. Format:

```
Source: [Provider Name] [Report Name] [Year Range]
```

Example: `Source: IMARC India Packaged Rice Report 2026-2034`

If the user doesn't provide a source, ask once: "What's the source for this data? It goes in the sidebar bottom."
