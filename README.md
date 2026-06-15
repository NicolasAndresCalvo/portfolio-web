# portfolio-web

Public portfolio website, built with [Astro](https://astro.build). Problem-focused
engineering write-ups, styled as a technical blog. Companion repo:
[`portfolio-infra`](../portfolio-infra) provisions the AWS hosting.

## How it works

```
[private workshop]  engineering-portfolio/cases/<...>/public/README.md
        │  scripts/sync-cases.mjs  (copies only public/, slug from frontmatter)
        ▼
[this repo]  src/content/cases/<slug>.md   →  astro build  →  dist/
        ▼
[AWS]  S3 static website  (CloudFront + nicolasandrescalvo.com in phase 2)
```

`src/content/cases/*.md` is generated from the private workshop but committed here, so CI
can build without workshop access. Re-run `npm run sync` and commit when you promote a case.

## Develop

```bash
npm install
npm run dev        # syncs cases, then starts the dev server (drafts visible)
```

## Build & deploy

```bash
npm run build              # local: sync + build
npm run build:ci          # CI: build only (content already committed)

AWS_S3_BUCKET=<bucket> ./scripts/deploy.sh     # build + push to S3 (+ invalidate if set)
```

CI (`.github/workflows/deploy.yml`) deploys on push to `main` via AWS OIDC. It needs:

| Kind | Name | Value |
|------|------|-------|
| secret | `AWS_DEPLOY_ROLE_ARN` | the deploy role from `portfolio-infra` |
| var | `AWS_REGION` | e.g. `eu-west-1` |
| var | `AWS_S3_BUCKET` | the bucket from `portfolio-infra` output |
| var | `CLOUDFRONT_DISTRIBUTION_ID` | phase 2, leave unset for now |

## Add / update a case

Write it in the workshop following `_publishing/CONVENTIONS.md` (technical `index.md` +
public `public/README.md`, anonymized). Then run `npm run sync` here and commit. Use the
frontmatter `slug:` to control the public URL.
