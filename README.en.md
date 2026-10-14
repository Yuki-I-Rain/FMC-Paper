# FMC Paper · Fewest Moves Challenge Sheet Generator

A Rubik's Cube Fewest Moves Challenge (FMC) sheet generator built with Vite + vanilla JavaScript. Features bilingual (Chinese/English) editing, strict validation for all 18 face turns, real-time six-face preview, PDF / PNG export and A4 printing. Everything runs locally in your browser — no submitted data is ever uploaded.

[简体中文](README.md)

## Features

- **Bilingual UI**: Switch between Chinese and English with one click; supports entering Chinese names and competition names.
- **Strict Input Validation**: Supports only six-face single-layer turns (`U D L R F B`, plus `'` and `2`); highlights errors in real time and counts moves.
- **Live Preview**: Six-face state diagram and A4 sheet layout update synchronously as you type.
- **Multi-format Export**: PDF / PNG export modules are loaded on demand; printing does not load the PDF library.
- **Local & Private**: All processing happens locally in the browser; no CDN, online fonts, or backend services are used.
- **Full Chinese Font**: Includes Noto Sans SC to support any Chinese input in preview, print, and export.

## Getting Started

### Use Online

No installation required — visit the live version:

👉 **https://yuki-i-rain.github.io/FMC-Paper/**

### Local Deployment

This project builds into a pure static site that can be hosted on any static HTTP server. The server does not need Node.js.

#### Option 1: Build from Source (Recommended)

Requires **Node.js 20.19+ or 22.12+** (a supported LTS version is recommended; verified on Node.js 22.16).

```sh
# 1. Clone the repository
git clone https://github.com/Yuki-I-Rain/FMC-Paper.git
cd FMC-Paper

# 2. Install dependencies
npm ci

# 3. Build the production version (outputs to dist/)
npm run build

# 4a. Run with the Vite preview server (easiest)
npm run preview
# Default URL: http://127.0.0.1:4173/

# 4b. Or host the dist/ directory with any static server
npx serve dist
# Or with Python:
#   cd dist && python -m http.server 8080
```

Place the **entire `dist/` directory** under any static HTTP service.

#### Option 2: Run in Development Mode

Suitable for code modification or debugging, with hot module replacement:

```sh
npm ci
npm run dev
```

Default URL: `http://127.0.0.1:5173/`.

> **Note**: Do not open `index.html` by double-clicking. The split ES modules must be loaded through an HTTP server.

## Deployment Notes

- Place the **contents of the entire `dist/` directory** under any static HTTP service to run; the service itself does not need Node.js or npm.
- Deployment in a website subdirectory is supported; the `assets/` subdirectory and its filenames must be preserved.
- When deploying a new version, replace the build files completely. Keeping old hashed assets until existing page sessions end prevents already-open old pages from failing to find components during export.
- This project does not include a Service Worker, mobile web app publishing, or a double-click executable build step. "Offline use" means the local server is still running; browser cache from a first visit to a remote site should not be treated as full offline support.
- Installing npm dependencies for the first time requires network access. After installation, you can start the local service offline; editing, exporting, and printing all run locally.

## Project Structure

```text
index.html             Page UI and module entry point
src/
  app.js               Page state, forms, language, and export menu
  core.js              Strict input parsing and cube computation
  sheet.js             Shared SVG sheet for preview / export / print
  i18n.js              Chinese and English copy
  styles.css           Screen, narrow-screen, and print styles
  font.js              Full Chinese font loading and in-memory reuse
  print.js             Browser print lifecycle
  credits.js           On-demand license text loading
  export/              PDF, PNG, and shared export helper code
  assets/              Fonts and icons
  licenses/            Original component and font license texts
scripts/               Build-time aggregation of npm production dependency licenses
tests/                 Independent cube reference model and browser regression checks
public/                Aggregated dependency licenses copied during build
dist/                  Deployable production build (generated after build)
```

Third-party libraries are installed via npm, with versions locked in `package-lock.json`. Modify only `src/` and page source files, then rebuild; do not modify `dist/` directly.

## Build Strategy

- HTML does not embed business scripts, third-party libraries, styles, or Base64 fonts.
- Vite minifies JavaScript / CSS and tree-shakes unused code, producing content-hashed asset files.
- jsPDF and svg2pdf.js are loaded only after selecting PDF; a separate PNG export module loads only after selecting PNG. Printing does not load the PDF library.
- If an export module fails to load, selecting export again retries with a new request URL, avoiding browser caching of failed requests. Already entered content is preserved, and successfully loaded modules are reused within the current page session.
- Other conversion features bundled with jsPDF may produce additional asynchronous files; this tool does not load them at startup.
- The full ~10.6 MB Noto Sans SC font is retained to support any Chinese name and competition name entered by the user. The font is requested once and the same bytes are reused for preview, print, PDF, and PNG. During PNG generation, the font is temporarily embedded in an in-memory SVG as required by the output image; it is not written back into the page HTML.
- A retry button is shown when the font fails; controls are restored when export fails. If component files are missing, check the service and the complete build files, then retry as prompted on the page.

## Verification

```sh
npm test
npm run build
npm run test:browser
```

Unit tests use an independent three-dimensional sticker model to verify all 18 turns, inverse turns, four-turn restoration, and input validation.

Browser tests automatically start a temporary local service, run the built version in a website subdirectory, and block external network requests. They test the menu, bilingual UI, font-failure retry, on-demand loading, export, print layout, and error input; results are written to `test-results/`.

Browser tests prefer an already installed Chrome. If none is available, run `npx playwright install chromium` (this step requires network access). You can also set `CHROME_PATH` to point to a browser executable.

The optional `FMC_BASELINE` environment variable points to the original single-file HTML; when enabled, it additionally compares the SVG of blank sheets and filled sheets in both languages to confirm the sheet template has not changed.

Print tests verify A4 layout and the call flow, and do not send jobs to a physical printer. Actual paper, scaling, headers/footers, and printer selection are still controlled by the browser's print dialog.

## Open Source Licenses

The page's "Open Source Credits" preserves the original component licenses. `public/THIRD-PARTY-NOTICES.txt` is generated before the build from the installed npm production dependencies and copied to `dist/THIRD-PARTY-NOTICES.txt`. The bundled font is accompanied by the SIL Open Font License.
