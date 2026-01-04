# reset_pubsub.sh
# This script resets the Pub/Sub emulator by deleting video upload subscriptions
# resets all the messages in the queue so no retry happens on restart.

#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-yt-clone-8285c}"
TOPIC="${TOPIC:-video-uploads-topic}"
SUBSCRIPTION="${SUBSCRIPTION:-video-uploads-subscription}"
PUSH_ENDPOINT="${PUSH_ENDPOINT:-https://video-processing-service-410145935945.us-central1.run.app/process-video}"

ACK_DEADLINE="${ACK_DEADLINE:-600}"
MESSAGE_RETENTION="${MESSAGE_RETENTION:-604800s}"
EXPIRATION_PERIOD="${EXPIRATION_PERIOD:-3888000s}"

echo "Project:      ${PROJECT_ID}"
echo "Topic:        ${TOPIC}"
echo "Subscription: ${SUBSCRIPTION}"
echo "Push endpoint:${PUSH_ENDPOINT}"
echo

gcloud config set project "${PROJECT_ID}" >/dev/null

echo "Checking topic exists..."
gcloud pubsub topics describe "${TOPIC}" >/dev/null

echo "Deleting subscription if it exists..."
if gcloud pubsub subscriptions describe "${SUBSCRIPTION}" >/dev/null 2>&1; then
  gcloud pubsub subscriptions delete "${SUBSCRIPTION}" --quiet
else
  echo "Subscription not found. Skipping delete."
fi

echo "Creating subscription..."
gcloud pubsub subscriptions create "${SUBSCRIPTION}" \
  --topic="${TOPIC}" \
  --push-endpoint="${PUSH_ENDPOINT}" \
  --ack-deadline="${ACK_DEADLINE}" \
  --message-retention-duration="${MESSAGE_RETENTION}" \
  --expiration-period="${EXPIRATION_PERIOD}"

echo
echo "Done. Current subscription state:"
gcloud pubsub subscriptions describe "${SUBSCRIPTION}" \
  --format="yaml(name,topic,state,ackDeadlineSeconds,messageRetentionDuration,expirationPolicy,pushConfig)"
echo