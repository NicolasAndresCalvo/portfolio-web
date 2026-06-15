# Content pipeline

How a piece of work becomes a published article.

```
[private workshop]  engineering-portfolio/cases/<...>/public/README.md
        │  (write following _publishing/CONVENTIONS.md, anonymized)
        │
        │  scripts/sync-cases.mjs   (copies only public/, slug from frontmatter)
        ▼
[portfolio-web]  src/content/cases/<slug>.md   (committed)
        │  npm run build  →  dist/
        ▼
[AWS]  S3 (+ CloudFront, phase 2)
```

## Rules that keep it safe

- Only `public/README.md` files are synced. The technical `index.md` (real names,
  numbers, repo names) never leaves the private workshop.
- The public URL uses the frontmatter `slug:`, never the workshop folder path, so
  client/project names cannot leak into the URL.
- The sync auto-marks any public file without frontmatter as `draft: true`, so nothing
  half-finished is published by accident.

## Writing style

Problem-first, no client names. Frame each article as: the problem and why it mattered,
the conventional assumption it breaks, the decisions and their trade-offs, the honest
"what was hard", and the transferable lesson. Never use the em dash.
