# Web Dockerfile (Vite → nginx)
# Build context: Root of repo
FROM oven/bun:1 AS builder

WORKDIR /app/apps/web

# Copy package files
COPY apps/web/package.json apps/web/bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY apps/web ./
COPY packages/shared ../../packages/shared

# Build
RUN bun run build

# Runtime with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
