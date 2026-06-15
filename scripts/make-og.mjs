// Generate the Open Graph card (public/og.png, 1200x630) from a branded SVG plus
// the profile photo, rendered with sharp. Re-run after changing the photo or copy.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const W = 1200, H = 630;

const bg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2dd4bf"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b0f17"/>
  <rect width="14" height="${H}" fill="url(#accent)"/>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif">
    <text x="90" y="150" fill="#2dd4bf" font-size="26" font-weight="700" letter-spacing="3">CLOUD &amp; DEVOPS ENGINEER · CLOUD ARCHITECT</text>
    <text x="86" y="250" fill="#e6edf3" font-size="76" font-weight="800">Nicolás Andrés</text>
    <text x="86" y="338" fill="#e6edf3" font-size="76" font-weight="800">Calvo</text>
    <text x="90" y="420" fill="#95a1b2" font-size="32" font-weight="500">CNCF Kubestronaut · AWS · Terraform · Kubernetes</text>
    <text x="90" y="540" fill="#2dd4bf" font-size="30" font-weight="700">nicolasandrescalvo.com</text>
  </g>
</svg>`);

const D = 300, CX = 860, CY = 165; // avatar box position
const mask = Buffer.from(`<svg width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`);
const ring = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CX + D / 2}" cy="${CY + D / 2}" r="${D / 2 + 5}" fill="none" stroke="#2dd4bf" stroke-width="4"/></svg>`);

const avatar = await sharp(readFileSync('public/profile.jpg'))
  .resize(D, D, { fit: 'cover' })
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();

await sharp(bg)
  .composite([
    { input: avatar, left: CX, top: CY },
    { input: ring, left: 0, top: 0 },
  ])
  .png()
  .toFile('public/og.png');

console.log('wrote public/og.png');
