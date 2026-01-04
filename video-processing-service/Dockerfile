# Docker file is like a blueprint for building a Docker image.
# It contains a set of instructions that Docker uses to create an image.
# This image can then be used to run a container, which is an isolated environment for running applications.
# The Dockerfile below is designed to set up a Node.js environment for a video processing service
# It includes steps to install dependencies, copy application files, and set up the environment for running the service.

# Video Processing Service Dockerfile

# Use Node 20 (align with Cloud runtimes and our package.json engines)
FROM node:20-bookworm-slim

# Install ffmpeg for transcoding
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# set the working directory in the container to /app
# This is where all subsequent commands will be run
WORKDIR /app

# Copy only what is needed for dependency resolution and build caching
COPY video-processing-service/package.json video-processing-service/package-lock.json ./video-processing-service/

# Copy shared package (single source of truth)
COPY packages/shared ./packages/shared

# Vendor shared into the service so `file:./local_packages/shared` works during Docker build
RUN mkdir -p ./video-processing-service/local_packages/shared \
  && cp -R ./packages/shared/* ./video-processing-service/local_packages/shared/

# Install dependencies inside the service directory
WORKDIR /app/video-processing-service
RUN npm ci

# Copy the rest of the service source
COPY video-processing-service ./

# Build TypeScript to dist/
RUN npm run build

# Remove devDependencies for a smaller runtime image
RUN npm prune --omit=dev

# Cloud Run provides PORT=8080; service must listen on it
EXPOSE 8080

# start the application just like we did locally
# Run compiled server
CMD ["node", "dist/index.js"]