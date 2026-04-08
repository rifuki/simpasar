# Deployment Guide

## ⚠️ Important: Setup Infrastructure First!

Before deploying this project, you must setup the infrastructure first:

```bash
# 1. Clone and setup server infrastructure
git clone git@github.com:rifuki/server.git ~/server
cd ~/server
cp .env.example .env
# Edit .env with your domain and email
docker compose up -d

# 2. Verify Traefik is running
docker ps --filter name=traefik
```

See: https://github.com/rifuki/server for detailed infrastructure setup.

---

## Quick Start

After infrastructure is ready:

```bash
# 1. Clone repo
git clone git@github.com:rifuki/simpasar.git
cd simpasar

# 2. Setup environment (copy from .env.prod.example)
cp apps/api/.env.prod.example apps/api/.env
cp apps/web/.env.prod.example apps/web/.env
# Edit .env files with your secrets

# 3. Deploy API
docker compose up -d

# 4. Verify
docker ps --filter name=simpasar
curl https://api.simpasar.rifuki.dev/health
```

## Prerequisites

- Docker & Docker Compose installed
- Traefik running (see https://github.com/rifuki/server)
- GitHub Container Registry access
- DNS configured:
  - `api.simpasar.rifuki.dev` → VPS IP
  - `simpasar.rifuki.dev` → Vercel (UI)

## Build & Deploy

### From Local (macOS → VPS)

```bash
# Build all images
./scripts/build.sh

# Push to GHCR
./scripts/push.sh

# Deploy on VPS
./scripts/deploy.sh
```

### Direct on VPS

```bash
# Pull pre-built images
VERSION=latest docker compose pull

# Start API
VERSION=latest docker compose up -d
```

## Services

| Service | Domain | Port | Profile |
|---------|--------|------|---------|
| API | api.simpasar.rifuki.dev | 3001 | default |
| Web | simpasar.rifuki.dev | - | Vercel |
| Web (backup) | simpasar.rifuki.dev | 80 | www |

## Frontend

UI deployed on **Vercel** by default.

Optional self-hosted:
```bash
docker compose --profile www up -d
```

## Troubleshooting

```bash
# Check logs
docker logs -f simpasar-api

# Restart
docker restart simpasar-api

# Full reset
docker compose down
docker compose up -d
```

## Environment Variables

### API (.env)
- `PORT=3001`
- `FRONTEND_URLS=https://simpasar.vercel.app,https://simpasar.rifuki.dev`
- `ADMIN_KEY`
- `LLM_PROVIDER=codex`
- `SOLANA_RPC_URL`
- `IDRX_AUTHORITY_SECRET`
- `IDRX_TOKEN_MINT`

### Web (.env)
- `VITE_API_URL=https://api.simpasar.rifuki.dev`
- `VITE_SOLANA_RPC_URL`

## Backup

Local backup location: `/Users/rifuki/mgodonf/web3/solana/simpasar/apps/`

```bash
# Copy from VPS to local
scp vps:~/projects/simpasar/apps/api/.env ./apps/api/.env.backup
```
