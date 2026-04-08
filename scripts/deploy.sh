#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()    { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
ok()     { echo -e "${GREEN}[OK]${NC} $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; }
info()   { echo -e "${CYAN}[INFO]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Auto-generate version
VERSION=${1:-$(git rev-parse --short HEAD)}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              SIMPASAR DEPLOYMENT                             ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Mode: %-52s ║\n" "API ONLY (Web on Vercel)"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Pull images
log "Pulling images from GHCR..."
VERSION=$VERSION docker compose pull

# Start services
log "Starting API service..."
VERSION=$VERSION docker compose up -d

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              DEPLOYMENT COMPLETE                             ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Status: %-50s ║\n" "RUNNING"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Active Services:                                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
docker ps --filter name=simpasar --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
