import './styles.css';
import { SOLVED, applyInput, escapeXml } from './core.js';
import { createSheet } from './sheet.js';
import { translate, localizeDOM } from './i18n.js';
import { loadSheetFont } from './font.js';
import { setupPrinting } from './print.js';
import { setupCredits } from './credits.js';
import { download } from './export/shared.js';
import { loadExporter } from './export/load.js';

const $ = id => document.getElementById(id);
const fieldIds = ['competition', 'round', 'attempt', 'competitor', 'wcaId'];
let language = 'zh';
let state = applyInput({ facelets: SOLVED, lastValid: '' }, '');
let fontReady = false, fontFailed = false, busy = false, busyFormat = '', issues = [], fontBytes = null;
let toastTimer, toastState = null, printing = false;
const t = (key, values) => translate(language, key, values);

function roundState() {
  const raw = $('round').value.trim();
  const normalized = raw.replace(/^0+/, '');
  return { valid: raw === '' || (/^[0-9]+$/.test(raw) && normalized !== ''), value: normalized };
}
function getData() {
  const round = roundState();
  return { ...Object.fromEntries(fieldIds.map(id => [id, $(id).value])), round: round.valid ? round.value : '', language, scramble: state.parsed.valid ? state.parsed.normalized : state.lastValid };
}
function highlightInput() {
  let markup = '', cursor = 0;
  for (const error of state.parsed.errors) {
    markup += escapeXml(state.raw.slice(cursor, error.start));
    markup += '<mark>' + escapeXml(state.raw.slice(error.start, error.end)) + '</mark>';
    cursor = error.end;
  }
  markup += escapeXml(state.raw.slice(cursor));
  $('input-highlight').innerHTML = markup + '\n';
  $('input-highlight').scrollTop = $('scramble').scrollTop;
}
function refresh() {
  const invalid = !state.parsed.valid;
  const sheet = createSheet(getData(), state.facelets, { invalid });
  const round = roundState();
  issues = [...sheet.issues, ...(round.valid ? [] : [t('roundInvalid')])];
  $('paper').innerHTML = sheet.svg;
  $('round').setAttribute('aria-invalid', String(!round.valid));
  $('field-errors').hidden = round.valid;
  $('field-errors').textContent = round.valid ? '' : t('roundInvalid');
  $('input-shell').classList.toggle('invalid', invalid);
  $('input-status').classList.toggle('invalid', invalid);
  $('scramble').setAttribute('aria-invalid', String(invalid));
  $('input-status-text').textContent = t(invalid ? 'invalidMoves' : state.parsed.moves.length ? 'validMoves' : 'emptyMoves');
  $('move-count').textContent = invalid ? t('needsFix') : t('moveCount', {count:state.parsed.moves.length});
  $('error-list').hidden = !invalid;
  $('error-list').textContent = invalid ? state.parsed.errors.slice(0, 6).map(e => t('invalidPosition', {start:e.start + 1, end:e.end, text:e.text})).join(' ') + (state.parsed.errors.length > 6 ? ' ' + t('moreErrors') : '') : '';
  $('preview-status').classList.toggle('invalid', invalid);
  $('preview-status-text').textContent = t(invalid ? 'waiting' : 'live');
  $('preview-warning').hidden = !invalid;
  $('preview-caption-text').hidden = invalid;
  $('export-issues').hidden = issues.length === 0;
  $('export-issues').textContent = issues.join(' ');
  const outputDisabled = busy || printing || !fontReady || invalid || issues.length > 0;
  for (const id of ['export-toggle', 'print-button', 'export-pdf', 'export-png']) $(id).disabled = outputDisabled;
  if (outputDisabled) closeExportMenu();
  $('export-note').textContent = printing ? t('openingPrint') : busy ? t('generating', {format:busyFormat}) : !fontReady ? t(fontFailed ? 'fontFailed' : 'preparingFont') : t(invalid ? 'fixMoves' : issues.length ? 'fixLayout' : 'exportNote');
  if (toastState) $('toast').textContent = t(toastState.key, toastState.values);
  highlightInput();
}
function inputChanged() { state = applyInput(state, $('scramble').value); refresh(); }
$('scramble').addEventListener('input', inputChanged);
$('scramble').addEventListener('scroll', () => { $('input-highlight').scrollTop = $('scramble').scrollTop; });
fieldIds.forEach(id => $(id).addEventListener('input', refresh));
$('clear-scramble').addEventListener('click', () => { $('scramble').value = ''; inputChanged(); $('scramble').focus(); });
for (const lang of ['zh', 'en']) $('lang-' + lang).addEventListener('click', () => {
  language = lang;
  localizeDOM(language);
  credits.localize();
  for (const item of ['zh', 'en']) { $('lang-' + item).classList.toggle('selected', item === lang); $('lang-' + item).setAttribute('aria-pressed', String(item === lang)); }
  refresh();
});

async function loadFont() {
  $('retry-font').hidden = true;
  fontFailed = false; refresh();
  try {
    fontBytes = await loadSheetFont();
    fontReady = true;
    refresh();
  } catch (error) {
    console.error('Sheet font:', error);
    fontFailed = true; refresh();
    $('retry-font').hidden = false;
  }
}
$('retry-font').addEventListener('click', loadFont);
function toast(key, values = {}) {
  clearTimeout(toastTimer); toastState = {key, values};
  $('toast').textContent = t(key, values); $('toast').hidden = false;
  toastTimer = setTimeout(() => { $('toast').hidden = true; toastState = null; }, 5000);
}
async function exportFile(format) {
  if (!canOutput() || printing) return;
  const data = getData();
  const markup = createSheet(data, state.facelets, { preview: false }).svg;
  busy = true; busyFormat = format.toUpperCase(); refresh();
  try {
    let exporter;
    try {
      exporter = await loadExporter(format);
    } catch (error) { throw new Error('componentsFailed', { cause: error }); }
    const blob = await exporter.generate({ markup, data, fontBytes });
    download(blob, `FMC-sheet-${data.language}.${format}`);
    toast('downloaded', { format: format.toUpperCase() });
  } catch (error) {
    console.error('Export:', error);
    toast(['componentsFailed', 'imageFailed'].includes(error.message) ? error.message : 'exportFailed');
  } finally { busy = false; refresh(); }
}
function canOutput() {
  return !busy && fontReady && state.parsed.valid && issues.length === 0;
}
function closeExportMenu(returnFocus = false) {
  $('export-menu').hidden = true;
  $('export-toggle').setAttribute('aria-expanded', 'false');
  if (returnFocus && !$('export-toggle').disabled) $('export-toggle').focus();
}
function openExportMenu(last = false) {
  if (!canOutput() || printing) return;
  $('export-menu').hidden = false;
  $('export-toggle').setAttribute('aria-expanded', 'true');
  $(last ? 'export-png' : 'export-pdf').focus();
}
$('export-toggle').addEventListener('click', () => {
  if ($('export-menu').hidden) openExportMenu(); else closeExportMenu(true);
});
$('export-toggle').addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault(); openExportMenu(event.key === 'ArrowUp');
  }
});
$('export-menu').addEventListener('keydown', event => {
  const items = [$('export-pdf'), $('export-png')];
  const index = items.indexOf(document.activeElement);
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  } else if (event.key === 'Tab') {
    event.preventDefault(); closeExportMenu();
    $(event.shiftKey ? 'export-toggle' : 'print-button').focus();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('export-menu').hidden) { event.preventDefault(); closeExportMenu(true); }
});
document.addEventListener('click', event => {
  if (!$('export-picker').contains(event.target)) closeExportMenu();
});
document.addEventListener('focusin', event => {
  if (!$('export-picker').contains(event.target)) closeExportMenu();
});
for (const format of ['pdf', 'png']) $('export-' + format).addEventListener('click', async () => {
  closeExportMenu();
  await exportFile(format);
  if (!$('export-toggle').disabled && (document.activeElement === document.body || $('export-menu').contains(document.activeElement))) $('export-toggle').focus();
});
setupPrinting({
  canOutput, getData, getFacelets: () => state.facelets, closeExportMenu,
  onBusyChange: value => { printing = value; refresh(); },
  t, toast,
});
const credits = setupCredits(t);
localizeDOM(language);
refresh();
loadFont();
