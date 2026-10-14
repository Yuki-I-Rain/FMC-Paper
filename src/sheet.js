import { COLORS, FACE_ORDER, escapeXml as esc } from './core.js';
import { SHEET } from './i18n.js';

const NS = 'http://www.w3.org/2000/svg';
const NET = { U: [3, 0], D: [3, 6], R: [6, 3], L: [0, 3], F: [3, 3], B: [9, 3] };

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
function measure(text, size) {
  ctx.font = `${size * 4}px FMCSheet`;
  return ctx.measureText(text).width / 4;
}
function wrap(text, width, size, wordMode = false) {
  const units = wordMode ? text.trim().split(/\s+/) : [...text];
  const lines = [];
  let line = '';
  for (const unit of units) {
    const next = line + (wordMode && line ? ' ' : '') + unit;
    if (line && measure(next, size) > width) { lines.push(line); line = unit; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
function text(x, y, value, size = 3.5, attrs = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" ${attrs}>${esc(value)}</text>`;
}
function line(x1, y1, x2, y2, color = '#999999', width = .25, attrs = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${attrs}/>`;
}

function createSheet(data, facelets, { invalid = false, preview = true } = {}) {
  const t = SHEET[data.language];
  const issues = [];
  const parts = ['<rect width="210" height="297" fill="white"/>'];
  parts.push('<g font-family="FMCSheet" font-weight="normal" fill="#141414">');
  parts.push('<rect x="7" y="7" width="196" height="283" fill="none" stroke="#999999" stroke-width="0.3"/>');
  parts.push(line(116, 7, 116, 137), line(7, 137, 203, 137), line(7, 153, 203, 153), line(116, 60, 203, 60), line(116, 76, 203, 76));
  parts.push(text(61.5, 19, t.title, 8.2, 'text-anchor="middle"'));
  let ruleY = 28;
  let lastRuleY = ruleY;
  for (const rule of t.rules) {
    const lines = wrap(rule, 98, 3.2, data.language === 'en');
    parts.push(text(10.5, ruleY, '•', 3.2));
    lines.forEach((value, i) => parts.push(text(14, ruleY + i * 4.6, value, 3.2, 'data-rule-line="true"')));
    lastRuleY = ruleY + (lines.length - 1) * 4.6;
    ruleY += lines.length * 4.6 + .7;
  }
  const rows = [t.clockwise, t.counter, t.double];
  const panelCenter = 61.5;
  const labelSize = 2.9;
  const maxLabelWidth = Math.max(...rows.map(r => measure(r, labelSize)));
  const labelGap = 8;
  const faceHeadingY = lastRuleY + 18;
  const rotationHeadingY = faceHeadingY + 27;
  // 面转动：6 个符号、间距 10 mm，将“标签 + 符号”整体居中到面板中心
  const faceSpacing = 10, faceSpan = 5 * faceSpacing;
  const faceBlockStart = panelCenter - (maxLabelWidth + labelGap + faceSpan) / 2;
  const faceLabelEnd = faceBlockStart + maxLabelWidth;
  const faceFirstSymbol = faceLabelEnd + labelGap;
  parts.push(text(panelCenter, faceHeadingY, t.faces, 3.7, 'text-anchor="middle" data-face-heading="true"'));
  for (let r = 0; r < 3; r++) {
    const y = faceHeadingY + 6 + r * 6;
    parts.push(text(faceLabelEnd, y, rows[r], labelSize, 'text-anchor="end"'));
    ['R', 'U', 'F', 'L', 'D', 'B'].forEach((f, i) => parts.push(text(faceFirstSymbol + i * faceSpacing, y, f + ['', "'", '2'][r], 3.3, 'text-anchor="middle"')));
  }
  // 整体转体：3 个符号、间距 15 mm，将“标签 + 符号”整体居中到面板中心
  const rotSpacing = 15, rotSpan = 2 * rotSpacing;
  const rotBlockStart = panelCenter - (maxLabelWidth + labelGap + rotSpan) / 2;
  const rotLabelEnd = rotBlockStart + maxLabelWidth;
  const rotFirstSymbol = rotLabelEnd + labelGap;
  parts.push(text(panelCenter, rotationHeadingY, t.rotations, 3.7, 'text-anchor="middle"'));
  for (let r = 0; r < 3; r++) {
    const y = rotationHeadingY + 6 + r * 5.5;
    parts.push(text(rotLabelEnd, y, rows[r], labelSize, 'text-anchor="end"'));
    ['x', 'y', 'z'].forEach((f, i) => parts.push(text(rotFirstSymbol + i * rotSpacing, y, f + ['', "'", '2'][r], 3.3, 'text-anchor="middle"')));
  }
  if (rotationHeadingY + 17 > 133) issues.push(t.rulesError);

  function fitted(value, width, initial, label, min = 2.7) {
    let size = initial;
    while (measure(value, size) > width && size > min) size = Math.max(min, size - .1);
    if (measure(value, size) > width) issues.push(label + t.tooLong);
    return size;
  }
  function field(key, label, value, y, blank = 'none') {
    const labelSize = 3.8;
    const start = 119 + measure(label + ': ', labelSize) + 1;
    parts.push(`<g data-info-row="${key}">`, text(119, y, label + ':', labelSize));
    if (value.trim()) parts.push(text(start, y, value.trim(), fitted(value.trim(), 199 - start, 3.8, label), `data-info-value="${key}"`));
    else if (blank === 'solid') parts.push(line(start, y + 1.2, 199, y + 1.2, '#444444', .25, 'data-handwriting="true"'));
    else if (blank === 'segments') {
      const step = (199 - start) / 10;
      for (let i = 0; i < 10; i++) parts.push(line(start + i * step, y + 1.2, start + (i + 1) * step - 1.4, y + 1.2, '#444444', .25, 'data-wca-slot="true"'));
    }
    parts.push('</g>');
  }
  // Competition always reserves its row; optional numeric rows collapse independently.
  if (data.competition.trim()) field('competition', t.competition, data.competition, 16);
  let infoY = 25;
  if (data.round) { field('round', t.round, t.roundValue.replace('{number}', data.round), infoY); infoY += 9; }
  if (data.attempt) { field('attempt', t.attempt, t.attemptValue.replace('{number}', data.attempt), infoY); infoY += 9; }
  field('competitor', t.name, data.competitor, infoY, 'solid');
  field('wcaId', t.id, data.wcaId, infoY + 9, 'segments');
  parts.push(text(159.5, 65.5, t.grading, data.language === 'en' ? 2.35 : 3, 'text-anchor="middle"'));
  parts.push(text(120, 72.5, t.graded + ':', 2.9), line(data.language === 'en' ? 136 : 131, 73.2, 167, 73.2, '#555555'));
  parts.push(text(171, 72.5, t.result + ':', 2.9), line(data.language === 'en' ? 182 : 179, 73.2, 198, 73.2, '#555555'));

  const originX = 123.5, originY = 80, cell = 6;
  const outline = 'M3 0 H6 V3 H12 V6 H6 V9 H3 V6 H0 V3 H3 Z';
  parts.push(`<g id="cube-net" transform="translate(${originX} ${originY}) scale(${cell})" aria-label="${t.cubeLabel}">`);
  if (invalid && preview) {
    parts.push('<defs data-preview-only="true"><linearGradient id="error-gradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9970"/><stop offset="0.48" stop-color="#ef244c"/><stop offset="1" stop-color="#ff8158"/></linearGradient><filter id="error-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="0.25"/></filter></defs>');
    parts.push(`<path data-preview-only="true" data-error-glow="true" d="${outline}" fill="none" stroke="url(#error-gradient)" stroke-width="0.65" stroke-linejoin="round" filter="url(#error-blur)" opacity="0.85"/>`);
    parts.push(`<path data-preview-only="true" d="${outline}" fill="none" stroke="url(#error-gradient)" stroke-width="0.2" stroke-linejoin="round"/>`);
  }
  for (let f = 0; f < 6; f++) {
    const face = FACE_ORDER[f], [ox, oy] = NET[face];
    for (let i = 0; i < 9; i++) parts.push(`<rect data-sticker="${face}${i}" x="${ox + i % 3}" y="${oy + Math.floor(i / 3)}" width="1" height="1" fill="${COLORS[facelets[f * 9 + i]]}" stroke="#141414" stroke-width="0.075"/>`);
  }
  parts.push('</g>');

  const scrambleSize = 3.6;
  const prefix = t.scramble + ': ';
  const scrambleLines = wrap(prefix + data.scramble, 188, scrambleSize, true);
  if (scrambleLines.length > 3) issues.push(t.scrambleError);
  const visibleLines = scrambleLines.slice(0, 3);
  // Align the actual glyph bounds as a block, rather than centering its baselines.
  ctx.font = `${scrambleSize * 4}px FMCSheet`;
  const bounds = visibleLines.map(value => ctx.measureText(value));
  const ascent = Math.max(...bounds.map(b => b.actualBoundingBoxAscent)) / 4;
  const descent = Math.max(...bounds.map(b => b.actualBoundingBoxDescent)) / 4;
  const blockHeight = ascent + descent + (visibleLines.length - 1) * 4.6;
  const firstBaseline = 137 + (16 - blockHeight) / 2 + ascent;
  parts.push('<g data-scramble-block="true">');
  visibleLines.forEach((value, i) => parts.push(text(11, firstBaseline + i * 4.6, value, scrambleSize, 'data-scramble-line="true"')));
  parts.push('</g>');
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 7 + (c + .5) * 19.6, y = 169 + r * (115 / 7);
      parts.push(line(x - 4.5, y, x + 4.5, y, '#9b9b9b', .26, 'data-answer-slot="true"'));
    }
  }
  parts.push('</g>');
  const svg = `<svg xmlns="${NS}" width="210mm" height="297mm" viewBox="0 0 210 297" role="img" aria-label="${t.previewLabel}">${parts.join('')}</svg>`;
  return { svg, issues: [...new Set(issues)] };
}


export { createSheet };
