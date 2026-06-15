// Sync ONLY the public case write-ups from the private workshop into this site.
//
// Source: <workshop>/cases/<...>/public/README.md   (anonymized, shareable)
// Output: src/content/cases/<engagement>-<project>.md
//
// The technical index.md files (real names/numbers) are NEVER touched. This keeps
// the private/public boundary that _publishing/ANONYMIZATION.md insists on.
//
// Configure the workshop location with WORKSHOP_DIR (defaults to the sibling clone).

import { readdir, readFile, writeFile, stat, mkdir, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { existsSync } from 'node:fs';

const WORKSHOP = process.env.WORKSHOP_DIR || join('..', '..', 'ibe', 'engineering-portfolio');
const CASES_DIR = join(WORKSHOP, 'cases');
const OUT_DIR = join('src', 'content', 'cases');

async function findPublicReadmes(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      found.push(...(await findPublicReadmes(full)));
    } else if (e.isFile() && e.name === 'README.md' && dir.endsWith(join('', 'public'))) {
      found.push(full);
    }
  }
  return found;
}

function slugFromPath(file) {
  // cases/iberia/ancillaries/volatile-architectures/public/README.md
  //   -> iberia-ancillaries-volatile-architectures
  const rel = relative(CASES_DIR, file);
  const parts = rel.split(/[\\/]/).filter((p) => p !== 'public' && p !== 'README.md');
  return parts.join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
}

function hasFrontmatter(text) {
  return /^---\r?\n/.test(text);
}

// Prefer an explicit `slug:` from the frontmatter for the public URL, so the site
// path never inherits the private workshop's folder names (client, project, etc.).
function frontmatterSlug(text) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!block) return null;
  const m = block[1].match(/^slug:\s*["']?([A-Za-z0-9._-]+)["']?\s*$/m);
  return m ? m[1] : null;
}

function firstHeading(text) {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : 'Untitled case';
}

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

async function ensureFrontmatter(text, file) {
  if (hasFrontmatter(text)) return text;
  // Synthesize minimal valid frontmatter so the build never breaks on a public
  // README that predates the frontmatter standard. Marked draft:true on purpose,
  // so nothing half-finished is published by accident, the title comes from the H1.
  const title = firstHeading(text);
  const { mtime } = await stat(file);
  const date = mtime.toISOString().slice(0, 10);
  const fm = [
    '---',
    `title: "${yamlEscape(title)}"`,
    `date: ${date}`,
    'draft: true',
    'tags: []',
    `summary: "${yamlEscape(title)}"`,
    '---',
    '',
  ].join('\n');
  return fm + text;
}

async function main() {
  if (!existsSync(CASES_DIR)) {
    console.warn(`[sync] workshop not found at "${CASES_DIR}". Set WORKSHOP_DIR. Skipping.`);
    return;
  }
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const files = await findPublicReadmes(CASES_DIR);
  let n = 0;
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const out = await ensureFrontmatter(raw, file);
    const slug = frontmatterSlug(out) || slugFromPath(file);
    await writeFile(join(OUT_DIR, `${slug}.md`), out, 'utf8');
    n++;
    console.log(`[sync] ${slug}`);
  }
  console.log(`[sync] ${n} public case(s) synced from ${CASES_DIR}`);
}

main().catch((err) => {
  console.error('[sync] failed:', err);
  process.exit(1);
});
