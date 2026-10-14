import { createSheet } from './sheet.js';

export function setupPrinting({ canOutput, getData, getFacelets, closeExportMenu, onBusyChange, t, toast }) {
  let printing = false;
  const mount = document.getElementById('print-sheet');
  function prepare() {
    if (canOutput()) {
      mount.innerHTML = createSheet(getData(), getFacelets(), { preview: false }).svg;
    } else {
      const message = document.createElement('p');
      message.className = 'print-unavailable';
      message.textContent = t('printUnavailable');
      mount.replaceChildren(message);
    }
  }
  function finish() {
    if (!printing) return;
    printing = false;
    onBusyChange(false);
  }
  window.addEventListener('beforeprint', () => { closeExportMenu(); prepare(); });
  window.addEventListener('afterprint', finish);
  document.getElementById('print-button').addEventListener('click', () => {
    if (!canOutput() || printing) return;
    closeExportMenu(); prepare();
    printing = true; onBusyChange(true);
    try { window.print(); }
    catch (error) { console.error('Print:', error); toast('printFailed'); }
    finally { finish(); }
  });
}
