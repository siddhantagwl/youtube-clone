# Stage 1: Build stage
FROM node:20 AS builder

# Set the working directory
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY yt-web-client/package.json ./yt-web-client/
COPY packages/shared ./packages/shared


# Install all dependencies
RUN npm install

# Copy source
COPY yt-web-client ./yt-web-client

# Build only the web workspace
WORKDIR /app/yt-web-client
RUN npm run build

# Stage 2: Production stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only what we need to run Next
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/yt-web-client ./yt-web-client

WORKDIR /app/yt-web-client

# Copy built app from the builder stage
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public

# Expose the listening port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]