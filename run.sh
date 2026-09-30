#!/usr/bin/env bash
# run.sh — Start the containers101 container with runtime env injection.
# POSIX-compatible bash.
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — must match the tag used by build.sh.
# ---------------------------------------------------------------------------
IMAGE_TAG="containers101:latest"
CONTAINER_NAME="containers101"

# ---------------------------------------------------------------------------
# Shared runtime detection — prefer Podman, fall back to Docker.
# ---------------------------------------------------------------------------
if command -v podman &>/dev/null; then
  RUNTIME="podman"
elif command -v docker &>/dev/null; then
  RUNTIME="docker"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]    Neither Podman nor Docker is installed. Aborting." >&2
  exit 1
fi

ts()    { date '+%Y-%m-%d %H:%M:%S'; }
step()  { echo "[$(ts)] [STEP $1/$TOTAL_STEPS] $2"; }
ok()    { echo "[$(ts)] [OK]       $1"; }
err()   { echo "[$(ts)] [ERROR]    $1" >&2; exit 1; }

TOTAL_STEPS=5

# ---------------------------------------------------------------------------
# STEP 1 — Report detected runtime.
# ---------------------------------------------------------------------------
step 1 "Detected container runtime"
ok "Using: $RUNTIME"

# ---------------------------------------------------------------------------
# STEP 2 — Pre-flight: .env must exist.
# ---------------------------------------------------------------------------
step 2 "Verifying .env file"
[[ -f .env ]] || err ".env not found. Copy .env.example to .env and populate it before running."
ok ".env found"

# ---------------------------------------------------------------------------
# STEP 3 — Read port mappings from .env.
# ---------------------------------------------------------------------------
step 3 "Reading port configuration from .env"
LIBERTY_HTTP_PORT=80
LIBERTY_HTTPS_PORT=9443
HOST_HTTP_PORT=4011
HOST_HTTPS_PORT=4012

while IFS='=' read -r key value; do
  value="${value%%#*}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  case "$key" in
    LIBERTY_HTTP_PORT)  LIBERTY_HTTP_PORT="$value"  ;;
    LIBERTY_HTTPS_PORT) LIBERTY_HTTPS_PORT="$value" ;;
    HOST_HTTP_PORT)     HOST_HTTP_PORT="$value"     ;;
    HOST_HTTPS_PORT)    HOST_HTTPS_PORT="$value"    ;;
  esac
done < <(grep -v '^\s*#' .env | grep -v '^\s*$')

ok "Host HTTP: $HOST_HTTP_PORT -> Container: $LIBERTY_HTTP_PORT | Host HTTPS: $HOST_HTTPS_PORT -> Container: $LIBERTY_HTTPS_PORT"

# ---------------------------------------------------------------------------
# STEP 4 — Remove a stale container with the same name if one exists.
#   Idempotent: a missing container is not an error.
# ---------------------------------------------------------------------------
step 4 "Removing stale container (if any): $CONTAINER_NAME"
"$RUNTIME" rm -f "$CONTAINER_NAME" 2>/dev/null && ok "Removed stale container" \
  || ok "No stale container to remove"

# ---------------------------------------------------------------------------
# STEP 5 — Start the container.
# ---------------------------------------------------------------------------
step 5 "Starting container: $CONTAINER_NAME"
CONTAINER_ID=$("$RUNTIME" run \
  --detach \
  --name "$CONTAINER_NAME" \
  --env-file .env \
  --publish "${HOST_HTTP_PORT}:${LIBERTY_HTTP_PORT}" \
  --publish "${HOST_HTTPS_PORT}:${LIBERTY_HTTPS_PORT}" \
  "$IMAGE_TAG") || err "Failed to start container. Check that image '$IMAGE_TAG' exists (run build.sh first)."

ok "Container started"
echo ""
echo "  Container ID : ${CONTAINER_ID}"
echo "  HTTP         : http://localhost:${HOST_HTTP_PORT}"
echo "  HTTPS        : https://localhost:${HOST_HTTPS_PORT}"
echo "  Health check : http://localhost:${HOST_HTTP_PORT}/health"
echo ""
echo "  Logs: $RUNTIME logs -f $CONTAINER_NAME"
echo "  Stop: $RUNTIME stop $CONTAINER_NAME"
