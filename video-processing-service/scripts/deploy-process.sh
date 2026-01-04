#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="yt-clone-8285c"
REGION="us-central1"
REPO="video-processing-repo"
SERVICE="video-processing-service"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE"

# Use linux/amd64 for Apple Silicon, otherwise empty
PLATFORM_ARG=""
ARCH="$(uname -m)"
if [[ "$ARCH" == "arm64" ]]; then
  PLATFORM_ARG="--platform linux/amd64"
fi

echo "Building image: $IMAGE"
docker build $PLATFORM_ARG -f video-processing-service/Dockerfile -t "$IMAGE" .

echo "Pushing image: $IMAGE"
docker push "$IMAGE"

echo "Deploying to Cloud Run: $SERVICE"
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --timeout 3600 \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --ingress internal

echo "Done."
