# Slide Patterns — pptxgenjs Code Skeletons

All patterns assume LAYOUT_WIDE (13.333" × 7.5"). Coordinates are in inches. Drop in your data, render, deliver.

## Shared shell (every slide)

```js
const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.defineLayout({ name: 'LAYOUT_WIDE', width: 13.333, height: 7.5 });

// Palette (locked default)
const C = {
  green:    '13352B',
  cream:    'F7F4EF',
  gold:     'C8A028',
  goldDark: '493000',
  indigo:   '3B4CA6',
  white:    'FFFFFF',
  gray:     'E8E4DC',
};

const slide = pres.addSlide();
slide.background = { color: C.cream };

// LEFT SIDEBAR RAIL — dark green, 0 to 2.0" wide, full height
slide.addShape(pres.ShapeType.rect, {
  x: 0, y: 0, w: 2.0, h: 7.5,
  fill: { color: C.green }, line: { color: C.green },
});

// VERTICAL CATEGORY LABEL on rail (replace with slide-specific text)
slide.addText('INDUSTRY\nLANDSCAPE', {
  x: 0.15, y: 2.6, w: 1.7, h: 1.8,
  fontFace: 'Calibri', fontSize: 24, bold: true, color: C.white,
  align: 'left', valign: 'top',
});

// SOURCE CITATION (bottom of rail)
slide.addText('Source: [REPLACE WITH SOURCE]', {
  x: 0.15, y: 6.9, w: 1.7, h: 0.5,
  fontFace: 'Calibri', fontSize: 9, bold: true, color: C.white,
  align: 'left', valign: 'top',
});

// CLIENT LOGO PLACEHOLDER (top-right)
slide.addShape(pres.ShapeType.rect, {
  x: 11.95, y: 0.2, w: 1.2, h: 0.8,
  fill: { color: C.white }, line: { color: C.gray, width: 1 },
});

// HIVEMINDS LOGO PLACEHOLDER (bottom-right)
slide.addShape(pres.ShapeType.rect, {
  x: 11.95, y: 6.85, w: 1.2, h: 0.5,
  fill: { color: C.white }, line: { color: C.gray, width: 1 },
});

// TITLE
slide.addText('Slide Title Here', {
  x: 2.3, y: 0.25, w: 9.5, h: 0.6,
  fontFace: 'Calibri', fontSize: 30, bold: true, color: C.green,
  align: 'left', valign: 'middle',
});

// SUBTITLE (italic gold)
slide.addText('Subtitle goes here · context · projection', {
  x: 2.3, y: 0.85, w: 9.5, h: 0.4,
  fontFace: 'Calibri', fontSize: 14, italic: true, color: C.gold,
  align: 'left', valign: 'middle',
});

// ... pattern-specific content goes below ...

pres.writeFile({ fileName: 'output.pptx' });
```

---

## P1 — Snapshot / Brief {#p1}

**When:** Executive brief, current-state snapshot. 3 stat cards across the top + supporting blocks below (roadmap text, mini bar chart).

**Sidebar additions:** This is the only pattern where the sidebar can have CHANNELS / KEY COMPETITORS lists.

```js
// SIDEBAR LISTS (only for P1)
slide.addText('CHANNELS', {
  x: 0.15, y: 1.4, w: 1.7, h: 0.3,
  fontFace: 'Calibri', fontSize: 11, bold: true, color: C.gold,
});
slide.addText([
  { text: '✓  Zepto\n', options: { color: C.white } },
  { text: '✓  Amazon\n', options: { color: C.white } },
  { text: '✓  BigBasket\n', options: { color: C.white } },
  { text: '◦  Flipkart\n', options: { color: C.white } },
  { text: '◦  Swiggy Instamart\n', options: { color: C.white } },
  { text: '◦  Blinkit', options: { color: C.white } },
], {
  x: 0.15, y: 1.7, w: 1.7, h: 1.8,
  fontFace: 'Calibri', fontSize: 11,
});

slide.addText('KEY COMPETITORS', {
  x: 0.15, y: 3.7, w: 1.7, h: 0.3,
  fontFace: 'Calibri', fontSize: 11, bold: true, color: C.gold,
});
slide.addText('•  Fortune\n•  Daawat\n•  India Gate', {
  x: 0.15, y: 4.0, w: 1.7, h: 1.0,
  fontFace: 'Calibri', fontSize: 11, color: C.white,
});

// 3 STAT CARDS (top row) — gold strip on top, big number, label below
const statCards = [
  { x: 2.5, value: '₹50L',   label: 'Monthly Media Spend' },
  { x: 6.2, value: '2.5x',   label: 'Current ROAS' },
  { x: 9.9, value: '100 MT', label: 'Quarterly Volume' },
];
statCards.forEach(c => {
  // Gold strip
  slide.addShape(pres.ShapeType.rect, {
    x: c.x, y: 1.5, w: 3.0, h: 0.1,
    fill: { color: C.gold }, line: { color: C.gold },
  });
  // White card
  slide.addShape(pres.ShapeType.rect, {
    x: c.x, y: 1.6, w: 3.0, h: 1.6,
    fill: { color: C.white }, line: { color: C.gray, width: 1 },
  });
  slide.addText(c.value, {
    x: c.x, y: 1.75, w: 3.0, h: 0.9,
    fontFace: 'Calibri', fontSize: 40, bold: true, color: C.green,
    align: 'center', valign: 'middle',
  });
  slide.addText(c.label, {
    x: c.x, y: 2.7, w: 3.0, h: 0.4,
    fontFace: 'Calibri', fontSize: 12, color: C.green,
    align: 'center', valign: 'middle',
  });
});

// BOTTOM-LEFT: Roadmap card
slide.addShape(pres.ShapeType.rect, {
  x: 2.5, y: 3.6, w: 4.7, h: 3.1,
  fill: { color: C.white }, line: { color: C.gray, width: 1 },
});
slide.addText('SCALE ROADMAP', {
  x: 2.7, y: 3.8, w: 4.3, h: 0.5,
  fontFace: 'Calibri', fontSize: 22, bold: true, color: C.gold,
});
slide.addText('100 MT → 800 MT', {
  x: 2.7, y: 4.5, w: 4.3, h: 0.7,
  fontFace: 'Calibri', fontSize: 28, bold: true, color: C.green,
});
slide.addText('8× scale target per quarter', {
  x: 2.7, y: 5.4, w: 4.3, h: 0.5,
  fontFace: 'Calibri', fontSize: 16, italic: true, color: C.green,
});

// BOTTOM-RIGHT: Mini horizontal bar card with title
slide.addShape(pres.ShapeType.rect, {
  x: 7.4, y: 3.6, w: 4.5, h: 3.1,
  fill: { color: C.white }, line: { color: C.gray, width: 1 },
});
slide.addText('Zepto drives demand for Zeeba', {
  x: 7.6, y: 3.8, w: 4.1, h: 0.5,
  fontFace: 'Calibri', fontSize: 16, italic: true, bold: true, color: C.green,
  align: 'center',
});
// Use addChart with type:bar, horizontal, two rows: Zepto 70%, Amazon+BB 30%
slide.addChart(pres.ChartType.bar, [
  { name: 'Share', labels: ['Zepto', 'Amazon + BB'], values: [70, 30] },
], {
  x: 7.6, y: 4.4, w: 4.1, h: 2.1,
  barDir: 'bar',
  chartColors: [C.green],
  catAxisLabelColor: C.green, catAxisLabelFontFace: 'Calibri', catAxisLabelFontSize: 11,
  valAxisHidden: true,
  showLegend: false,
  showValue: true,
  dataLabelColor: C.white, dataLabelFontFace: 'Calibri', dataLabelFontSize: 11, dataLabelFontBold: true,
  dataLabelFormatCode: '0"%"',
});
```

---

## P2 — Stacked bar + donut callouts {#p2}

**When:** Showing a split (branded vs non-branded, organised vs unorganised) with stacked bars + circular percentage callouts on the right. One main chart panel takes the centre.

```js
// MAIN CHART PANEL (white card)
slide.addShape(pres.ShapeType.rect, {
  x: 2.3, y: 1.5, w: 7.5, h: 5.6,
  fill: { color: C.white }, line: { color: C.gray, width: 1 },
});

// STACKED BAR CHART
slide.addChart(pres.ChartType.bar, [
  { name: 'Non-Branded/Loose', labels: ['2024', '2033'], values: [322, 338] },
  { name: 'Branded',           labels: ['2024', '2033'], values: [173, 199] },
], {
  x: 2.5, y: 1.7, w: 7.1, h: 5.2,
  barDir: 'col', barGrouping: 'stacked',
  chartColors: [C.gold, C.indigo],
  catAxisLabelFontFace: 'Calibri', catAxisLabelFontSize: 12, catAxisLabelColor: C.green,
  valAxisLabelFontFace: 'Calibri', valAxisLabelFontSize: 11,
  showLegend: true, legendPos: 't', legendFontFace: 'Calibri', legendFontSize: 11,
  showValue: true,
  dataLabelColor: C.white, dataLabelFontFace: 'Calibri', dataLabelFontSize: 14, dataLabelFontBold: true,
});

// DONUT CALLOUTS on right — two big circles with % inside
const callouts = [
  { y: 1.9, big: '35%',  label: 'Branded' },
  { y: 4.5, big: '65%',  label: 'Non-Branded' },
];
callouts.forEach(c => {
  slide.addShape(pres.ShapeType.ellipse, {
    x: 10.2, y: c.y, w: 2.0, h: 2.0,
    fill: { color: C.green }, line: { color: C.gold, width: 3 },
  });
  slide.addText(c.big, {
    x: 10.2, y: c.y + 0.3, w: 2.0, h: 0.8,
    fontFace: 'Calibri', fontSize: 32, bold: true, color: C.white,
    align: 'center',
  });
  slide.addText(c.label, {
    x: 10.2, y: c.y + 1.1, w: 2.0, h: 0.5,
    fontFace: 'Calibri', fontSize: 12, color: C.white,
    align: 'center',
  });
});
```

---

## P3 — Stat cards + dual chart {#p3}

**When:** 3 stat cards across the top + 2 charts side-by-side below.

```js
// 3 STAT CARDS (top row, slightly smaller than P1 to leave room below)
const stats = [
  { x: 2.4, value: '13.68M MT', label: 'Market Size 2025' },
  { x: 6.0, value: '21.09M MT', label: 'Projected 2034' },
  { x: 9.6, value: '4.75%',     label: 'CAGR 2026–2034' },
];
stats.forEach(s => {
  slide.addShape(pres.ShapeType.rect, {
    x: s.x, y: 1.4, w: 3.3, h: 1.2,
    fill: { color: C.white }, line: { color: C.gray, width: 1 },
  });
  slide.addText(s.value, {
    x: s.x, y: 1.45, w: 3.3, h: 0.6,
    fontFace: 'Calibri', fontSize: 26, bold: false, color: C.green,
    align: 'center', valign: 'middle',
  });
  slide.addText(s.label, {
    x: s.x, y: 2.0, w: 3.3, h: 0.5,
    fontFace: 'Calibri', fontSize: 12, bold: true, color: C.green,
    align: 'center',
  });
});

// LEFT CHART — vertical bars (volume growth)
slide.addText('VOLUME GROWTH (MILLION TONS)', {
  x: 2.4, y: 2.9, w: 4.5, h: 0.4,
  fontFace: 'Calibri', fontSize: 12, bold: true, color: C.green,
});
slide.addChart(pres.ChartType.bar, [
  { name: 'MT', labels: ['2025', '2034'], values: [13.68, 21.09] },
], {
  x: 2.4, y: 3.3, w: 4.5, h: 3.7,
  barDir: 'col',
  chartColors: [C.green, C.gold],
  chartColorsOpacity: 100,
  showLegend: false,
  showValue: true,
  dataLabelColor: C.green, dataLabelFontBold: true, dataLabelFontFace: 'Calibri', dataLabelFontSize: 11,
  dataLabelFormatCode: '0.00 "MT"',
  valAxisHidden: true,
  catAxisLabelFontFace: 'Calibri', catAxisLabelFontSize: 12, catAxisLabelColor: C.green,
});

// RIGHT CHART — horizontal bars (channel split)
slide.addText('DISTRIBUTION CHANNEL SPLIT (2025)', {
  x: 7.3, y: 2.9, w: 5.5, h: 0.4,
  fontFace: 'Calibri', fontSize: 12, bold: true, color: C.green,
});
slide.addChart(pres.ChartType.bar, [
  { name: 'Share', labels: ['Other Channels', 'Online & E-Commerce', 'Modern Trade', 'General Trade (Kirana)'], values: [8.5, 15.3, 23.3, 52.8] },
], {
  x: 7.3, y: 3.3, w: 5.5, h: 3.7,
  barDir: 'bar',
  chartColors: [C.green],
  showLegend: false,
  showValue: true,
  dataLabelColor: C.white, dataLabelFontBold: true, dataLabelFontFace: 'Calibri', dataLabelFontSize: 11,
  dataLabelFormatCode: '0.0"%"',
  valAxisHidden: true,
  catAxisLabelFontFace: 'Calibri', catAxisLabelFontSize: 11, catAxisLabelColor: C.green,
});
```

---

## P4 — Donut + table combo {#p4}

**When:** Donut chart on the left with a category sidebar list, comparison table on the right.

```js
// LEFT: Category portfolio mini-list (small dark card with white items below)
slide.addShape(pres.ShapeType.rect, {
  x: 2.3, y: 1.5, w: 1.6, h: 0.5,
  fill: { color: C.green }, line: { color: C.green },
});
slide.addText('Category Portfolio\nOverview', {
  x: 2.3, y: 1.5, w: 1.6, h: 0.5,
  fontFace: 'Calibri', fontSize: 9, bold: true, color: C.white,
  align: 'center', valign: 'middle',
});
const cats = ['Basmati', 'Brown Rice', 'Sona Masuri', 'Organic Rice'];
cats.forEach((cat, i) => {
  slide.addShape(pres.ShapeType.rect, {
    x: 2.3, y: 2.1 + i * 0.6, w: 1.6, h: 0.5,
    fill: { color: C.white }, line: { color: C.gray, width: 1 },
  });
  slide.addText(cat, {
    x: 2.3, y: 2.1 + i * 0.6, w: 1.6, h: 0.5,
    fontFace: 'Calibri', fontSize: 11, color: C.green,
    align: 'center', valign: 'middle',
  });
});

// CENTER: Donut chart with center label
slide.addChart(pres.ChartType.doughnut, [
  { name: 'Platform', labels: ['Blinkit', 'Zepto', 'Swiggy', 'Flipkart', 'Amazon', 'BB'],
    values: [780, 360, 320, 360, 300, 120] },
], {
  x: 4.2, y: 1.5, w: 4.0, h: 4.0,
  chartColors: ['F0AE24', 'B07CC6', 'EE3F8E', 'EC5B2C', '3B4CA6', 'A6A6A6'],
  showLegend: false,
  dataLabelColor: C.white, dataLabelFontBold: true, dataLabelFontFace: 'Calibri', dataLabelFontSize: 10,
  showPercent: true,
  holeSize: 60,
});
slide.addText('2240 Cr', {
  x: 4.2, y: 3.1, w: 4.0, h: 0.5,
  fontFace: 'Calibri', fontSize: 22, bold: true, color: C.green, align: 'center',
});
slide.addText('Annual Total Market', {
  x: 4.2, y: 3.55, w: 4.0, h: 0.4,
  fontFace: 'Calibri', fontSize: 11, color: C.green, align: 'center',
});

// Donut legend (manual, below chart)
const legendItems = [
  { label: 'Blinkit', val: '780Cr', color: 'F0AE24' },
  { label: 'Zepto',   val: '360Cr', color: 'B07CC6' },
  { label: 'FK',      val: '360Cr', color: 'EE3F8E' },
  { label: 'Swiggy',  val: '320Cr', color: 'EC5B2C' },
  { label: 'Amazon',  val: '300Cr', color: '3B4CA6' },
  { label: 'BB',      val: '120Cr', color: 'A6A6A6' },
];
legendItems.forEach((it, i) => {
  const x = 4.2 + (i % 6) * 0.7;
  slide.addShape(pres.ShapeType.ellipse, {
    x: x, y: 5.7, w: 0.15, h: 0.15, fill: { color: it.color }, line: { color: it.color },
  });
  slide.addText(`${it.label}\n${it.val}`, {
    x: x + 0.18, y: 5.6, w: 0.6, h: 0.5,
    fontFace: 'Calibri', fontSize: 8, color: C.green,
  });
});

// RIGHT: Platform comparison table (Platform | YoY Growth | Proj)
const rows = [
  ['Platform', 'YoY Growth', 'Proj Apr\'27'],
  ['Blinkit',  '30%',   '1014 Cr'],
  ['Zepto',    '20%',   '432 Cr'],
  ['Flipkart', '7.5%',  '387 Cr'],
  ['Swiggy',   '15%',   '368 Cr'],
  ['Amazon',   '7.5%',  '322.5 Cr'],
  ['Bigbasket','5%',    '126 Cr'],
];
slide.addTable(rows, {
  x: 8.6, y: 1.5, w: 4.3,
  colW: [1.7, 1.3, 1.3],
  fontFace: 'Calibri', fontSize: 11, color: C.green,
  border: { type: 'solid', pt: 0.5, color: C.gray },
  rowH: 0.5,
});
```

---

## P5 — Data table + insight panel {#p5}

**When:** Wide data table on the left (brand-by-platform numbers) + narrow insight/recommendation panel on the right with coloured callout boxes.

```js
// LEFT: Big data table
const tableData = [
  ['Brand', 'Zepto', 'Swiggy', 'Blinkit', 'Amazon'],
  ['India Gate',     '18', '28', '23', '33'],
  ['DAAWAT',         '27', '22', '15', '26'],
  ['Kohinoor',       '4',  '7',  '3',  '21'],
  ['FORTUNE',        '9',  '10', '9',  '11'],
  ['ZEEBA',          '12', '-',  '-',  '26'],
  ['Vedaka',         '-',  '-',  '-',  '5'],
  ['Double Horse',   '7',  '5',  '6',  '3'],
  ['Organic Tattva', '8',  '10', '9',  '4'],
  ['24 Mantra Organic','4','7',  '2',  '1'],
  ['KISAANSAY',      '4',  '-',  '2',  '13'],
];

// Header row separately styled
slide.addTable([tableData[0]], {
  x: 2.3, y: 1.5, w: 6.5,
  colW: [2.1, 1.1, 1.1, 1.1, 1.1],
  fontFace: 'Calibri', fontSize: 11, bold: true, color: C.white,
  fill: { color: C.green },
  rowH: 0.45,
  border: { type: 'solid', pt: 0.5, color: C.green },
  align: 'center',
});
slide.addTable(tableData.slice(1), {
  x: 2.3, y: 1.95, w: 6.5,
  colW: [2.1, 1.1, 1.1, 1.1, 1.1],
  fontFace: 'Calibri', fontSize: 11, color: C.green,
  rowH: 0.42,
  border: { type: 'solid', pt: 0.5, color: C.gray },
  align: 'center',
});

// RIGHT: Insight panel
slide.addText('India Gate & Daawat\nFocusing On Product\nRanges Across Platforms', {
  x: 9.0, y: 1.5, w: 3.8, h: 1.3,
  fontFace: 'Calibri', fontSize: 16, bold: true, color: C.indigo,
  align: 'center', valign: 'middle',
});

slide.addText('For Zeeba', {
  x: 9.0, y: 2.9, w: 3.8, h: 0.5,
  fontFace: 'Calibri', fontSize: 18, bold: true, color: C.gold,
  align: 'center',
});

// Two stacked callout cards (Q-Comm + E-Comm)
const callouts = [
  { y: 3.5, header: 'Q-Commerce',  body: 'Hero Products\nExpansion',     color: C.indigo },
  { y: 5.2, header: 'E-Commerce',  body: 'New Product\nLaunch Tests',    color: C.gold },
];
callouts.forEach(c => {
  // Header strip
  slide.addShape(pres.ShapeType.rect, {
    x: 9.0, y: c.y, w: 3.8, h: 0.5,
    fill: { color: c.color }, line: { color: c.color },
  });
  slide.addText(c.header, {
    x: 9.0, y: c.y, w: 3.8, h: 0.5,
    fontFace: 'Calibri', fontSize: 14, bold: true, color: C.white,
    align: 'center', valign: 'middle',
  });
  // Body card
  slide.addShape(pres.ShapeType.rect, {
    x: 9.0, y: c.y + 0.5, w: 3.8, h: 1.0,
    fill: { color: C.white }, line: { color: c.color, width: 2 },
  });
  slide.addText(c.body, {
    x: 9.0, y: c.y + 0.5, w: 3.8, h: 1.0,
    fontFace: 'Calibri', fontSize: 14, bold: true, color: C.green,
    align: 'center', valign: 'middle',
  });
});
```

---

## Pattern Selection Cheat Sheet

Match the user's data shape:
- 3 KPIs + scaling story → **P1**
- Two-segment percentage split → **P2**
- 3 KPIs + two charts → **P3**
- One donut + comparison table → **P4**
- Big data table + recommendations → **P5**

Doesn't fit? Build custom — but always keep:
- Sidebar rail at `x:0, w:2.0`, `#13352B` fill
- Vertical category label on rail
- Source citation bottom-left of rail
- Logo placeholders top-right and bottom-right
- Title 30pt bold dark green at top
- Subtitle italic gold under title
- Cream `#F7F4EF` canvas
- Calibri throughout
