# API Dockerfile (Bun)
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY packages/shared ../packages/shared

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

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
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/../packages/shared ../packages/shared

# Default port
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
