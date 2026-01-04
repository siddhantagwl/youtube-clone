# YouTube Clone - Video Processing Pipeline

This project implements an **event-driven video processing pipeline** inspired by YouTube’s upload and ingestion flow. It focuses on backend architecture, asynchronous processing, and real-world failure handling rather than UI polish or scale optimizations.

## High-Level Architecture

1. **User uploads** a raw video to Google Cloud Storage
2. **Upload triggers** an event to Pub/Sub
3. **Pub/Sub pushes** an HTTP request to a Cloud Run video processing service
4. **The video processing service:**
   - Downloads the raw video
   - Transcodes it with FFmpeg
   - Uploads the processed version
   - Updates metadata in Firestore
5. The frontend fetches metadata and processed video URLs separately.

## Key Characteristics

The system is:
- **Asynchronous** - Non-blocking operations
- **Idempotent** - Safe to retry operations
- **Failure-aware** - Handles errors gracefully

### Key Point
> The web app never blocks on video processing. Everything after upload is background work.

## Tech Stack

- TypeScript
- Node.js + Express
- FFmpeg
- Docker
- Google Cloud Run
- Google Cloud Storage
- Google Cloud Pub/Sub
- Firebase Firestore
- Firebase Authentication (web app)

## Video Processing Flow

1. A raw video is uploaded to the `raw-uploads` bucket.
2. Pub/Sub sends an HTTP POST to `/process-video`.
3. The service validates the payload and extracts the video ID.
4. Idempotency is enforced using Firestore metadata.
5. The video is downloaded locally and transcoded to 360p.
6. The processed video is uploaded to the processed bucket.
7. Firestore metadata is updated with final status.

## Idempotency Strategy

Pub/Sub guarantees at-least-once delivery, so duplicate messages are expected.

- Each video has a deterministic ID: `<uid>-<timestamp>`
- Firestore tracks processing state (`processing`, `processed`, `failed`)
- If a video already has a status, processing is skipped
- HTTP 2xx responses acknowledge messages and stop retries

## Failure Handling

Failures are classified intentionally:

| Failure Type | Example | Behavior |
|-------------|--------|---------|
| Permanent | FFmpeg codec error | Mark failed, return 200 |
| Permanent | Raw object missing | Mark failed, return 204 |
| Transient | Network or infra issue | Return 500 to retry |

This prevents infinite retries while preserving automatic recovery for transient failures.

## Observability

- Structured one-line logs for each state transition
- FFmpeg stderr captured only on failure
- Progress logs disabled to reduce log volume and cost
- Logs represent state changes, not internal noise

## Why Cloud Run

- Supports long-running FFmpeg jobs
- Containerized dependencies
- Explicit CPU and memory control
- No execution time limits like Cloud Functions

## Known Limitations

- No adaptive bitrate streaming (single resolution output)
- No retry backoff strategy for failed videos
- No manual retry endpoint yet
- Not production hardened for scale or abuse

## Purpose

This project was built to deeply understand:
- Event-driven backend systems
- Cloud-native async processing
- Failure modes and retry semantics
- Real-world FFmpeg behavior

>It is intentionally not optimized for cost or scale.