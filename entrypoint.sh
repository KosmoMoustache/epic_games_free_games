#!/bin/sh
set -eu

mkdir -p /app/db/migrations
cp -R /app/migrations/. /app/db/migrations/

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

: "${EGFG_SCHEDULE:?EGFG_SCHEDULE must be set, e.g. '0 */6 * * *'}"

if [ "${EGFG_RUN_ON_START:-true}" = "true" ]; then
  if ! (cd /app && node ./src/index.ts); then
    echo "Initial run failed; waiting for the next scheduled run" >&2
  fi
fi

CRONTAB=/tmp/egfg-crontab
printf '%s cd /app && node ./src/index.ts\n' "$EGFG_SCHEDULE" > "$CRONTAB"
exec supercronic -passthrough-logs "$CRONTAB"
