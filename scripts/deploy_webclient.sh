#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-yt-clone-8285c}"
REGION="${REGION:-us-central1}"

SERVICE_NAME="${SERVICE_NAME:-yt-web-client}"
AR_REPO="${AR_REPO:-yt-web-client-repo}"
IMAGE_NAME="${IMAGE_NAME:-yt-web-client}"

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${IMAGE_NAME}:latest"

echo "Project: ${PROJECT_ID}"
echo "Region:  ${REGION}"
echo "Service: ${SERVICE_NAME}"
echo "Image:   ${IMAGE_URI}"
echo

# Make sure gcloud is pointing at the right project
gcloud config set project "${PROJECT_ID}" >/dev/null
gcloud config set run/region "${REGION}" >/dev/null

# Make sure Docker can push to Artifact Registry
gcloud auth configure-docker "${REGION}-docker.pkg.dev" -q

echo "Building image (linux/amd64) using yt-web-client/Dockerfile..."
docker build \
  --platform linux/amd64 \
  -t "${IMAGE_URI}" \
  -f yt-web-client/Dockerfile \
  .

echo "Pushing image..."
docker push "${IMAGE_URI}"

echo "Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated

echo
echo "Web Client Service deployed successfully."
echo "Check Cloud Run console for canonical URL."
