import insertionLicense from './licenses/insertionfinder.txt?url';
import pdfLicense from './licenses/jspdf.txt?url';
import svgLicense from './licenses/svg2pdf.txt?url';
import fontLicense from './licenses/font.txt?url';

const notices = [
  ['insertionfinder 0.5.0', insertionLicense],
  ['jsPDF 4.2.1', pdfLicense],
  ['svg2pdf.js 2.8.1', svgLicense],
  ['Noto Sans SC Regular', fontLicense],
];

export function setupCredits(t) {
  const dialog = document.getElementById('credits-dialog');
  const status = document.getElementById('credits-status');
  let pending = false, loaded = false, statusKey = '';
  function localize() {
    status.hidden = !statusKey;
    status.textContent = statusKey ? t(statusKey) : '';
  }
  document.getElementById('show-credits').addEventListener('click', async event => {
    event.preventDefault(); dialog.showModal();
    if (pending || loaded) return;
    pending = true; statusKey = 'creditsLoading'; localize();
    try {
      const texts = await Promise.all(notices.map(async ([, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('License unavailable');
        return response.text();
      }));
      const content = document.getElementById('credits-content');
      content.replaceChildren(...notices.map(([name], i) => {
        const details = document.createElement('details');
        const summary = document.createElement('summary'); summary.textContent = name;
        const pre = document.createElement('pre'); pre.textContent = texts[i];
        details.append(summary, pre); return details;
      }));
      loaded = true; statusKey = '';
    } catch { statusKey = 'creditsFailed'; }
    finally { pending = false; localize(); }
  });
  return { localize };
}
