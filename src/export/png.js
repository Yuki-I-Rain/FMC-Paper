import { base64, withSvg } from './shared.js';

export function generate({ markup, fontBytes }) {
  return withSvg(markup, async svg => {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `@font-face{font-family:FMCSheet;src:url(data:font/ttf;base64,${base64(fontBytes)}) format('truetype');font-weight:400;font-style:normal}`;
    svg.prepend(style);
    svg.setAttribute('width', '2480');
    svg.setAttribute('height', '3508');
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('imageFailed'));
        image.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = 2480; canvas.height = 3508;
      const context = canvas.getContext('2d');
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('imageFailed');
      return blob;
    } finally { URL.revokeObjectURL(url); }
  });
}
