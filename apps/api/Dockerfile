# API Dockerfile (Bun)
# Build context: Root of repo (../.. from apps/api)
FROM oven/bun:1-slim

WORKDIR /app/apps/api

# Install SSL certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY apps/api/package.json apps/api/bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./
COPY packages/shared ../../packages/shared

# Default port
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
