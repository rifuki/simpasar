#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()    { echo -e "${BLUE}[BUILD&PUSH]${NC} $1"; }
ok()     { echo -e "${GREEN}[OK]${NC} $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; }
info()   { echo -e "${CYAN}[INFO]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Auto-generate version
VERSION=${1:-$(git rev-parse --short HEAD)}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          SIMPASAR BUILD & PUSH TO GHCR                       ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Platform: %-48s ║\n" "linux/amd64"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

log "Starting build phase..."
./scripts/build.sh $VERSION

echo ""
log "Starting push phase..."
./scripts/push.sh $VERSION

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          BUILD & PUSH COMPLETE                               ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Status: %-50s ║\n" "ALL IMAGES BUILT AND PUSHED"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
info "Deploy on VPS:"
echo "  ./scripts/deploy.sh $VERSION"
echo ""
