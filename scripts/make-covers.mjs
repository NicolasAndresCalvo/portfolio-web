// Generate a branded cover image per case (public/covers/<slug>.png) from its
// title, rendered with sharp. Run after syncing content; covers are committed so
// CI can build without regenerating. Re-run when a title changes.
import sharp from 'sharp';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'src/content/cases';
const OUT = 'public/covers';
const W = 1200, H = 600;

mkdirSync(OUT, { recursive: true });

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const mm = line.match(/^(\w+):\s*(.*)$/);
      if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

function escapeXml(s) {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

// Strip a leading emoji and wrap into lines of ~maxChars.
function wrap(title, maxChars = 24, maxLines = 4) {
  const clean = title.replace(/^\s*[^\w(]+\s*/, '').trim();
  const words = clean.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

for (const file of readdirSync(SRC).filter((f) => f.endsWith('.md'))) {
  const slug = file.replace(/\.md$/, '');
  const fm = frontmatter(readFileSync(join(SRC, file), 'utf8'));
  const title = fm.title || slug;
  const tag = (fm.tags || '').replace(/[[\]"']/g, '').split(',')[0].trim().toUpperCase() || 'CASE STUDY';

  const lines = wrap(title);
  const startY = H / 2 - (lines.length - 1) * 34 - 10;
  const titleSvg = lines
    .map((l, i) => `<text x="80" y="${startY + i * 68}" fill="#e6edf3" font-size="54" font-weight="800">${escapeXml(l)}</text>`)
    .join('');

  const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0f17"/>
      <stop offset="1" stop-color="#0e1b1c"/>
    </linearGradient>
    <linearGradient id="ac" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2dd4bf"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="8" fill="url(#ac)"/>
  <rect x="${W - 128}" y="48" width="64" height="64" rx="16" fill="url(#ac)"/>
  <text x="${W - 96}" y="94" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="40" font-weight="800" fill="#07120f" text-anchor="middle">N</text>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
    <text x="80" y="${startY - 56}" fill="#2dd4bf" font-size="24" font-weight="700" letter-spacing="3">${escapeXml(tag)}</text>
    ${titleSvg}
    <text x="80" y="${H - 56}" fill="#95a1b2" font-size="24" font-weight="600">nicolasandrescalvo.com</text>
  </g>
</svg>`);

  await sharp(svg).png().toFile(join(OUT, `${slug}.png`));
  console.log('cover:', slug);
}
