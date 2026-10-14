import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const lock = JSON.parse(await fs.readFile(path.join(root, 'package-lock.json'), 'utf8'));
const blocks = ['FMC Paper — npm production dependency notices\n\nFull Noto Sans SC font license: src/licenses/font.txt (also distributed in assets).'];
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location || entry.dev) continue;
  const directory = path.join(root, location);
  let names;
  try { names = await fs.readdir(directory); }
  catch { if (entry.optional) continue; throw new Error(`Missing dependency: ${location}. Run npm ci first.`); }
  const pkg = JSON.parse(await fs.readFile(path.join(directory, 'package.json'), 'utf8'));
  const licenses = names.filter(name => /^(licen[sc]e|copying|copyright|notice)(\.|$)/i.test(name));
  const texts = await Promise.all(licenses.map(async name => {
    const file = path.join(directory, name);
    if (!(await fs.stat(file)).isFile()) return '';
    return `${name}\n${await fs.readFile(file, 'utf8')}`;
  }));
  blocks.push(`${pkg.name} ${pkg.version}\nLicense: ${typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license)}\n${texts.filter(Boolean).join('\n\n')}`);
}
await fs.mkdir(path.join(root, 'public'), { recursive: true });
await fs.writeFile(path.join(root, 'public/THIRD-PARTY-NOTICES.txt'), blocks.join('\n\n' + '='.repeat(72) + '\n\n'));
console.log('Production dependency license notices generated.');
