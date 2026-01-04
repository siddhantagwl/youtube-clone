#  a single deploy script that orchestrates all services.
# Firebase Functions first, then backend workers on Cloud Run, then the frontend.
# This avoids partial deployments and keeps the system consistent.

#!/usr/bin/env bash
set -euo pipefail

echo
echo "======================================"
echo "DEPLOY ALL – youtube-clone"
echo "======================================"
echo

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Repo root: $ROOT_DIR"
echo

# -----------------------------
# 1. Firebase Functions
# -----------------------------
echo ">>> Deploying Firebase Functions"
cd "$ROOT_DIR/yt-api-service/functions"
npm run deploy

echo
echo "✓ Firebase Functions deployed"
echo

# -----------------------------
# 2. Video Processing Service
# -----------------------------
echo ">>> Deploying Video Processing Service"
cd "$ROOT_DIR"
./scripts/deploy_video_processing.sh

echo
echo "✓ Video Processing Service deployed"
echo

# -----------------------------
# 3. Web Client
# -----------------------------
echo ">>> Deploying Web Client"
cd "$ROOT_DIR"
./scripts/deploy_webclient.sh

echo
echo "✓ Web Client deployed"
echo

echo "======================================"
echo "ALL SERVICES DEPLOYED SUCCESSFULLY"
echo "======================================"