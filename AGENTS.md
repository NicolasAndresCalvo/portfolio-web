# AGENTS.md — portfolio-web

The public portfolio website. Astro static site. Public repo.

## What it is

Problem-focused engineering write-ups (case studies), styled after a technical blog.
No client names: each piece is framed as a pattern + decision + outcome.

## How content works

- Authored in the private workshop (`../ibe/engineering-portfolio/cases/*/public/README.md`).
- `scripts/sync-cases.mjs` copies ONLY the public READMEs into `src/content/cases/*.md`,
  using each file's frontmatter `slug:` for the URL (so the path never leaks workshop
  folder names). Set `WORKSHOP_DIR` to override the default location.
- `src/content/cases/*.md` is committed (CI has no workshop access). Re-run `npm run sync`
  and commit when promoting a case.

## Commands

- `npm run dev` — sync + dev server (drafts visible).
- `npm run build` — sync + build (local).
- `npm run build:ci` — build only, no sync (used by CI; content already committed).
- `AWS_S3_BUCKET=... ./scripts/deploy.sh` — build + push to S3 (+ invalidate if set).

## Conventions

- Frontmatter: `title, date, slug, draft, role, tags, summary` (validated in `src/content.config.ts`).
- `draft: true` hides a case in prod, shows it in dev.
- Mermaid fences render via a remark plugin + client mermaid in `BaseLayout.astro`.
- Never paste real client names, account ids or secrets. Content must already be public-safe.

## Deploy

CI (`.github/workflows/deploy.yml`) builds and deploys on push to `main` via AWS OIDC.
Needs repo secret `AWS_DEPLOY_ROLE_ARN` and vars `AWS_REGION`, `AWS_S3_BUCKET`,
`CLOUDFRONT_DISTRIBUTION_ID` (the role + bucket come from `portfolio-infra`).
