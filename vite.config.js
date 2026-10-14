import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Emit real split chunks while exposing their final URLs for failed-load retries.
// A plain import() of the same failed URL is permanently cached by browsers.
function exporterUrls() {
  const id = '\0fmc-exporter-urls';
  let building = false;
  return {
    name: 'fmc-exporter-urls',
    configResolved(config) { building = config.command === 'build'; },
    resolveId(source) { if (source === 'virtual:fmc-exporters') return id; },
    load(source) {
      if (source !== id) return;
      const entries = ['pdf', 'png'].map(format => {
        const file = `./src/export/${format}.js`;
        if (!building) return `${format}: ${JSON.stringify('/src/export/' + format + '.js')}`;
        const reference = this.emitFile({ type: 'chunk', id: fileURLToPath(new URL(file, import.meta.url)), name: format, preserveSignature: 'strict' });
        return `${format}: import.meta.ROLLUP_FILE_URL_${reference}`;
      });
      return `export const urls = { ${entries.join(', ')} };`;
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [exporterUrls()],
  build: {
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    minify: true,
    cssMinify: true,
    sourcemap: false,
    manifest: true,
  },
});
