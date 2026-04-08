# API Dockerfile (Bun)
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files from root
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build (if needed)
# RUN bun run build

# Runtime
FROM oven/bun:1-slim

WORKDIR /app

# Install SSL certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy built app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./

# Set working directory to API
WORKDIR /app/apps/api

# Default port
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
