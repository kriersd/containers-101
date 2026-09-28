#!/usr/bin/env bash
# build.sh — Build the launch-next-chapter container image.
# POSIX-compatible bash. Re-runnable without manual cleanup.
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — edit IMAGE_TAG to change the output image name.
# ---------------------------------------------------------------------------
IMAGE_TAG="launch-next-chapter:latest"

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

# ---------------------------------------------------------------------------
# Helper: timestamped step / ok / error emitters.
# ---------------------------------------------------------------------------
ts()    { date '+%Y-%m-%d %H:%M:%S'; }
step()  { echo "[$(ts)] [STEP $1/$TOTAL_STEPS] $2"; }
ok()    { echo "[$(ts)] [OK]       $1"; }
err()   { echo "[$(ts)] [ERROR]    $1" >&2; exit 1; }

TOTAL_STEPS=4

# ---------------------------------------------------------------------------
# STEP 1 — Report detected runtime.
# ---------------------------------------------------------------------------
step 1 "Detected container runtime"
ok "Using: $RUNTIME"

# ---------------------------------------------------------------------------
# STEP 2 — Source build-args from .env if present.
# ---------------------------------------------------------------------------
step 2 "Loading build arguments from .env"
LIBERTY_HTTP_PORT=9080
LIBERTY_HTTPS_PORT=9443

if [[ -f .env ]]; then
  # Parse only the two port vars; avoid eval-ing the whole file for security.
  while IFS='=' read -r key value; do
    # Strip inline comments and surrounding whitespace from the value.
    value="${value%%#*}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    case "$key" in
      LIBERTY_HTTP_PORT)  LIBERTY_HTTP_PORT="$value"  ;;
      LIBERTY_HTTPS_PORT) LIBERTY_HTTPS_PORT="$value" ;;
    esac
  done < <(grep -v '^\s*#' .env | grep -v '^\s*$')
  ok "Loaded LIBERTY_HTTP_PORT=$LIBERTY_HTTP_PORT LIBERTY_HTTPS_PORT=$LIBERTY_HTTPS_PORT from .env"
else
  ok "No .env found — using defaults: HTTP=$LIBERTY_HTTP_PORT HTTPS=$LIBERTY_HTTPS_PORT"
fi

# ---------------------------------------------------------------------------
# STEP 3 — Verify Dockerfile exists.
# ---------------------------------------------------------------------------
step 3 "Verifying Dockerfile"
[[ -f Dockerfile ]] || err "Dockerfile not found in $(pwd). Run this script from the project root."
ok "Dockerfile found"

# ---------------------------------------------------------------------------
# STEP 4 — Build the image.
# ---------------------------------------------------------------------------
step 4 "Building image: $IMAGE_TAG"
"$RUNTIME" build \
  --build-arg "LIBERTY_HTTP_PORT=${LIBERTY_HTTP_PORT}" \
  --build-arg "LIBERTY_HTTPS_PORT=${LIBERTY_HTTPS_PORT}" \
  --tag "$IMAGE_TAG" \
  . || err "Image build failed. Review the $RUNTIME output above for details."

ok "Image built successfully: $IMAGE_TAG"
