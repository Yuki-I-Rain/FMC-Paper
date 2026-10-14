import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import { base64, withSvg } from './shared.js';

export function generate({ markup, data, fontBytes }) {
  return withSvg(markup, async svg => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
    doc.addFileToVFS('NotoSansSC-Regular.ttf', base64(fontBytes));
    doc.addFont('NotoSansSC-Regular.ttf', 'FMCSheet', 'normal');
    doc.setFont('FMCSheet', 'normal');
    doc.setProperties({
      title: data.competition || (data.language === 'zh' ? '最少步试卷' : 'Fewest Moves worksheet'),
      subject: 'A4 Fewest Moves worksheet', creator: 'FMC Paper',
    });
    await doc.svg(svg, { x: 0, y: 0, width: 210, height: 297 });
    return doc.output('blob');
  });
}
