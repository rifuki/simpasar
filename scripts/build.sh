#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()    { echo -e "${BLUE}[BUILD]${NC} $1"; }
ok()     { echo -e "${GREEN}[OK]${NC} $1"; }
error()  { echo -e "${RED}[ERROR]${NC} $1"; }
info()   { echo -e "${CYAN}[INFO]${NC} $1"; }
warn()   { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Auto-generate version from git commit hash
VERSION=${1:-$(git rev-parse --short HEAD)}
TOTAL=2
CURRENT=0

print_header() {
  local service="$1"
  local image="$2"
  CURRENT=$((CURRENT + 1))
  
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  printf "║ %-58s ║\n" "${service} [${CURRENT}/${TOTAL}]"
  echo "╠══════════════════════════════════════════════════════════════╣"
  printf "║ Image: %-51s ║\n" "$image"
  printf "║ Version: %-49s ║\n" "$VERSION"
  printf "║ Mode: %-52s ║\n" "LOCAL BUILD (NO PUSH)"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              SIMPASAR BUILD SYSTEM                           ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Platform: %-48s ║\n" "linux/amd64"
printf "║ Total Services: %-42s ║\n" "$TOTAL"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Build API
print_header "Simpasar API" "ghcr.io/rifuki/simpasar-api:$VERSION"
log "Building simpasar-api (linux/amd64)..."
docker build \
  --platform linux/amd64 \
  --cache-from ghcr.io/rifuki/simpasar-api:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t ghcr.io/rifuki/simpasar-api:$VERSION \
  -t ghcr.io/rifuki/simpasar-api:latest \
  -t simpasar-api:local \
  ./apps/api 2>&1
ok "simpasar-api built successfully"

# Build Web
print_header "Simpasar Web" "ghcr.io/rifuki/simpasar-web:$VERSION"
log "Building simpasar-web (linux/amd64)..."
docker build \
  --platform linux/amd64 \
  --cache-from ghcr.io/rifuki/simpasar-web:latest \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t ghcr.io/rifuki/simpasar-web:$VERSION \
  -t ghcr.io/rifuki/simpasar-web:latest \
  -t simpasar-web:local \
  ./apps/web 2>&1
ok "simpasar-web built successfully"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              BUILD COMPLETE                                  ║"
echo "╠══════════════════════════════════════════════════════════════╣"
printf "║ Version: %-49s ║\n" "$VERSION"
printf "║ Status: %-50s ║\n" "LOCAL BUILD COMPLETED"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Built Images:                                                ║"
printf "║  • %-56s ║\n" "ghcr.io/rifuki/simpasar-api:$VERSION"
printf "║  • %-56s ║\n" "ghcr.io/rifuki/simpasar-web:$VERSION"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
info "Next steps:"
echo "  ./scripts/push.sh $VERSION    → Push to GHCR"
echo "  ./scripts/deploy.sh $VERSION  → Deploy on VPS"
echo ""
