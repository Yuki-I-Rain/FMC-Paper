import fontUrl from './assets/NotoSansSC-Regular.ttf?url';

let fontPromise;

/** Share the same complete font bytes across preview, print and both exporters. */
export function loadSheetFont() {
  if (!fontPromise) {
    fontPromise = (async () => {
      const response = await fetch(fontUrl);
      if (!response.ok) throw new Error('fontFailed');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const face = new FontFace('FMCSheet', bytes, { weight: '400', style: 'normal' });
      await face.load();
      document.fonts.add(face);
      return bytes;
    })().catch(error => {
      fontPromise = undefined;
      throw error;
    });
  }
  return fontPromise;
}
