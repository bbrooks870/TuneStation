#!/bin/bash
set -e

cd "$(dirname "$0")"

# Load Cloudflare credentials if present
if [ -f /root/.cf_creds ]; then
  source /root/.cf_creds
elif [ -f .env.deploy ]; then
  source .env.deploy
fi

CF_ZONE_ID="${CF_ZONE_ID:-f208e1fe24ff58f14e21fb07b5143bae}"
CF_EMAIL="${CF_EMAIL:-guptaofficial17@gmail.com}"

echo "--> Building & restarting container..."
docker compose build
docker compose up -d

if [ -n "$CF_KEY" ]; then
  echo "--> Purging Cloudflare Edge Cache for songs.watchtvs.live..."
  curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
    -H "X-Auth-Email: ${CF_EMAIL}" \
    -H "X-Auth-Key: ${CF_KEY}" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}' | grep -o '"success":[^,}]*'
  echo "--> Deploy complete & cache purged successfully!"
else
  echo "--> Deploy complete! (CF_KEY not set, skipping remote cache purge)"
fi
