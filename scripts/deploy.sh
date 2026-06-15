#!/usr/bin/env bash
# Build the site and push it to S3 (and invalidate CloudFront if configured).
#
# This repo (portfolio-web) is decoupled from portfolio-infra: it does not read
# Terraform state. It takes the target bucket (and optional distribution) from the
# environment, which in CI come from GitHub repo variables, and locally from your shell.
#
# Usage:
#   AWS_S3_BUCKET=my-bucket ./scripts/deploy.sh
#   AWS_S3_BUCKET=my-bucket CLOUDFRONT_DISTRIBUTION_ID=E123 ./scripts/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

: "${AWS_S3_BUCKET:?Set AWS_S3_BUCKET (see portfolio-infra outputs)}"

echo "==> Building site"
npm run build

echo "==> Syncing dist/ to s3://${AWS_S3_BUCKET}"
aws s3 sync dist/ "s3://${AWS_S3_BUCKET}" --delete

if [ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]; then
  echo "==> Invalidating CloudFront ${CLOUDFRONT_DISTRIBUTION_ID}"
  aws cloudfront create-invalidation --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*" >/dev/null
fi

echo "==> Done."
