#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()    { echo -e "${BLUE}[PUSH]${NC} $1"; }
ok()     { echo -e "${GREEN}[OK]${NC} $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
info()   { echo -e "${CYAN}[INFO]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Auto-generate version
VERSION=${1:-$(git rev-parse --short HEAD)}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              SIMPASAR PUSH TO GHCR                           ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Registry: %-48s ║\n" "ghcr.io/rifuki"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

echo "🔐 Using cached Docker credentials for GHCR..."

# Push all images
log "Pushing simpasar-api:$VERSION..."
docker push ghcr.io/rifuki/simpasar-api:$VERSION
docker push ghcr.io/rifuki/simpasar-api:latest
ok "simpasar-api pushed"

log "Pushing simpasar-web:$VERSION..."
docker push ghcr.io/rifuki/simpasar-web:$VERSION
docker push ghcr.io/rifuki/simpasar-web:latest
ok "simpasar-web pushed"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              PUSH COMPLETE                                   ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Status: %-50s ║\n" "ALL IMAGES PUSHED TO GHCR"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
info "Deploy on VPS:"
echo "  ./scripts/deploy.sh $VERSION"
echo ""
