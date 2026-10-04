#!/usr/bin/env bash
# Builds the lucario-frontend image with NEXT_PUBLIC_MAPBOX_TOKEN baked in
# (Next.js inlines NEXT_PUBLIC_* vars at `npm run build` time, so the token
# has to arrive as a --build-arg, not a runtime env var), then restarts the
# abhi_nginx stack so it picks up the new image.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_DIR="$SCRIPT_DIR/../abhi_nginx"

ENV_FILE="$SCRIPT_DIR/.env.local"
[ -f "$ENV_FILE" ] || ENV_FILE="$SCRIPT_DIR/.env"

TOKEN=$(grep -E '^NEXT_PUBLIC_MAPBOX_TOKEN' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d ' "')

if [ -z "$TOKEN" ]; then
    echo "error: NEXT_PUBLIC_MAPBOX_TOKEN not found in $ENV_FILE" >&2
    exit 1
fi

cd "$SCRIPT_DIR"
docker buildx build --load --build-arg NEXT_PUBLIC_MAPBOX_TOKEN="$TOKEN" -t lucario-frontend .

cd "$NGINX_DIR"
docker compose down
docker compose up --build -d
