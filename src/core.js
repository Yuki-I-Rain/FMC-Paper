import { Algorithm, Cube } from 'insertionfinder';

const SOLVED = new Cube().toFaceletString();
const FACE_ORDER = 'UDRLFB';
const COLORS = { U: '#ffffff', D: '#ffdf00', L: '#ff8b17', R: '#e8252b', F: '#12bb48', B: '#1659d9' };

/** Scan the complete input; the underlying library intentionally accepts more notation. */
function parseScramble(input) {
  const moves = [];
  const errors = [];
  let i = 0;
  while (i < input.length) {
    if (/\s/u.test(input[i])) { i++; continue; }
    const start = i;
    if (/[UDLRFB]/.test(input[i])) {
      let move = input[i++];
      if (input[i] === "'" || input[i] === '2') move += input[i++];
      if (i < input.length && !/[UDLRFB\s]/u.test(input[i])) {
        while (i < input.length && !/[UDLRFB\s]/u.test(input[i])) i++;
        errors.push({ start, end: i, text: input.slice(start, i) });
      } else moves.push(move);
    } else {
      while (i < input.length && !/[UDLRFB\s]/u.test(input[i])) i++;
      errors.push({ start, end: i, text: input.slice(start, i) });
    }
  }
  return { valid: errors.length === 0, moves, normalized: moves.join(' '), errors };
}

function computeFacelets(moves) {
  const cube = new Cube();
  cube.twist(new Algorithm(Array.isArray(moves) ? moves.join(' ') : moves));
  return cube.toFaceletString();
}

function applyInput(previous, raw) {
  const parsed = parseScramble(raw);
  return {
    raw, parsed,
    facelets: parsed.valid ? computeFacelets(parsed.moves) : previous.facelets,
    lastValid: parsed.valid ? parsed.normalized : previous.lastValid,
  };
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}


export { SOLVED, COLORS, FACE_ORDER, parseScramble, computeFacelets, applyInput, escapeXml };
