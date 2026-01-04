# Docker file is like a blueprint for building a Docker image.
# It contains a set of instructions that Docker uses to create an image.
# This image can then be used to run a container, which is an isolated environment for running applications.
# The Dockerfile below is designed to set up a Node.js environment for a video processing service
# It includes steps to install dependencies, copy application files, and set up the environment for running the service.


# use an official Node.js image as a base
FROM node:18

# set the working directory in the container to /app
# This is where all subsequent commands will be run
WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy service package.json
COPY video-processing-service/package.json video-processing-service/package-lock.json ./video-processing-service/

# Install system dependencies
RUN apt-get update && apt-get install -y ffmpeg

# install workspace dependencies
RUN npm install

# Copy the rest of the service source
COPY video-processing-service ./video-processing-service

# Move into service directory
WORKDIR /app/video-processing-service

# expose the port the app runs on.
# coz the port might not be necessarily availble to us outside the container ubless we explicitly expose it
# EXPOSE 3000

EXPOSE 8080

# start the application just like we did locally
CMD ["npm", "start"]