#!/usr/bin/env bash
# rebuild.sh — Full teardown-and-rebuild cycle.
# Invokes build.sh; on success, invokes run.sh. If build.sh fails, run.sh is skipped.
# POSIX-compatible bash. Safe to re-run.
set -euo pipefail

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

TOTAL_STEPS=3

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------
# STEP 1 — Report detected runtime.
# ---------------------------------------------------------------------------
step 1 "Detected container runtime"
ok "Using: $RUNTIME"

# ---------------------------------------------------------------------------
# STEP 2 — Build phase.
# ---------------------------------------------------------------------------
step 2 "BUILD PHASE — invoking build.sh"
echo "================================================================"

if ! bash "${SCRIPT_DIR}/build.sh"; then
  echo "================================================================"
  err "Build phase failed. run.sh was NOT invoked. Review the build output above."
fi

echo "================================================================"
ok "Build phase completed successfully"

# ---------------------------------------------------------------------------
# STEP 3 — Run phase.
# ---------------------------------------------------------------------------
step 3 "RUN PHASE — invoking run.sh"
echo "================================================================"

if ! bash "${SCRIPT_DIR}/run.sh"; then
  echo "================================================================"
  err "Run phase failed. Container may not be running. Review the output above."
fi

echo "================================================================"
ok "Rebuild complete — container is running"
