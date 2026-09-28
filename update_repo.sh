#!/usr/bin/env bash
# update_repo.sh — Delete and re-clone a GitHub repository, preserving the .env file.
# Can be called directly or invoked automatically by pull_repo.sh.
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — set GITHUB_REPO to skip the interactive prompt on future runs.
# Format: "owner/repo-name"  e.g. GITHUB_REPO="myorg/my-app"
# If invoked by pull_repo.sh, GITHUB_REPO is inherited from the environment.
# ---------------------------------------------------------------------------
GITHUB_REPO="${GITHUB_REPO:-}"

# ---------------------------------------------------------------------------
# Helper: timestamped step / ok / error emitters.
# ---------------------------------------------------------------------------
ts()   { date '+%Y-%m-%d %H:%M:%S'; }
step() { echo "[$(ts)] [STEP $1/$TOTAL_STEPS] $2"; }
ok()   { echo "[$(ts)] [OK]       $1"; }
err()  { echo "[$(ts)] [ERROR]    $1" >&2; exit 1; }
info() { echo "[$(ts)] [INFO]     $1"; }

TOTAL_STEPS=6

# Temporary location for .env backup — outside the application directory so
# it survives the rm -rf of the app directory in step 4.
ENV_BACKUP="/tmp/.env.backup"

# ---------------------------------------------------------------------------
# STEP 1 — Verify the GitHub CLI is installed.
# ---------------------------------------------------------------------------
step 1 "Checking for GitHub CLI (gh)"

if ! command -v gh &>/dev/null; then
  cat >&2 <<EOF

[$(ts)] [ERROR]    GitHub CLI (gh) is not installed.

  Install it by following the official instructions at:
    https://cli.github.com/

  Quick install reference:

  Ubuntu / Debian:
    sudo apt update
    sudo apt install -y gh

  RHEL / CentOS / Fedora:
    sudo dnf install -y gh
      — or —
    sudo yum install -y gh

  macOS (Homebrew):
    brew install gh

  After installation, re-run this script.

EOF
  exit 1
fi

ok "GitHub CLI found: $(gh --version | head -n1)"

# ---------------------------------------------------------------------------
# STEP 2 — Resolve the target repository.
# ---------------------------------------------------------------------------
step 2 "Resolving target repository"

if [[ -z "${GITHUB_REPO}" ]]; then
  echo ""
  read -rp "  Enter the GitHub repository (owner/repo-name): " GITHUB_REPO
  echo ""
  info "Repository set to: ${GITHUB_REPO}"
  info "ADVISORY: To avoid this prompt in future runs, open update_repo.sh and set"
  info "          GITHUB_REPO=\"${GITHUB_REPO}\" in the configuration block at the top."
  echo ""
fi

[[ "${GITHUB_REPO}" =~ ^[^/]+/[^/]+$ ]] \
  || err "GITHUB_REPO must be in 'owner/repo-name' format. Got: '${GITHUB_REPO}'"

REPO_NAME="${GITHUB_REPO##*/}"
ok "Target repo: ${GITHUB_REPO}  →  local directory: ./${REPO_NAME}"

# ---------------------------------------------------------------------------
# STEP 3 — Ensure the user is authenticated to GitHub.
# ---------------------------------------------------------------------------
step 3 "Checking GitHub authentication"

if ! gh auth status &>/dev/null; then
  info "Not authenticated. Launching interactive login..."
  echo ""
  gh auth login || err "GitHub authentication failed or was cancelled. Re-run this script to try again."
  echo ""
fi

ok "Authenticated to GitHub as: $(gh api user --jq '.login' 2>/dev/null || echo '(verified)')"

# ---------------------------------------------------------------------------
# STEP 4 — Back up the .env file before destructive operations.
# ---------------------------------------------------------------------------
step 4 "Preserving .env file (if present)"

ENV_WAS_BACKED_UP=false

if [[ -f "${REPO_NAME}/.env" ]]; then
  cp "${REPO_NAME}/.env" "${ENV_BACKUP}" \
    || err "Failed to back up .env to '${ENV_BACKUP}'. Check permissions on /tmp."
  ENV_WAS_BACKED_UP=true
  ok ".env backed up to: ${ENV_BACKUP}"
else
  info "No .env file found in './${REPO_NAME}' — nothing to back up"
fi

# ---------------------------------------------------------------------------
# STEP 5 — Remove the existing directory and clone a fresh copy.
# ---------------------------------------------------------------------------
step 5 "Removing existing directory and cloning fresh copy"

if [[ -d "${REPO_NAME}" ]]; then
  rm -rf "${REPO_NAME}" \
    || err "Failed to remove directory './${REPO_NAME}'. Check permissions."
  info "Removed: ./${REPO_NAME}"
fi

info "Cloning ${GITHUB_REPO}..."
gh repo clone "${GITHUB_REPO}" "${REPO_NAME}" \
  || err "Failed to clone '${GITHUB_REPO}'. Verify the repository name and your access permissions."

ok "Repository cloned to: ./${REPO_NAME}"

# ---------------------------------------------------------------------------
# STEP 6 — Restore the .env file into the freshly cloned directory.
# ---------------------------------------------------------------------------
step 6 "Restoring .env file"

if [[ "${ENV_WAS_BACKED_UP}" == true ]]; then
  if [[ -f "${ENV_BACKUP}" ]]; then
    cp "${ENV_BACKUP}" "${REPO_NAME}/.env" \
      || err "Failed to restore .env from '${ENV_BACKUP}' to './${REPO_NAME}/.env'. Check permissions."
    rm -f "${ENV_BACKUP}"
    ok ".env restored to: ./${REPO_NAME}/.env  (backup removed)"
  else
    # Backup file disappeared between steps — flag clearly rather than silently
    # continuing without the env file, which could cause hard-to-diagnose runtime failures.
    err "Backup file '${ENV_BACKUP}' was expected but not found. The .env file could not be restored. Resolve manually."
  fi
else
  info "No .env backup was made — skipping restore"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo ""
ok "Update complete"
echo ""
echo "  Repository : ${GITHUB_REPO}"
echo "  Location   : $(pwd)/${REPO_NAME}"
echo "  .env file  : $(if [[ "${ENV_WAS_BACKED_UP}" == true ]]; then echo "preserved"; else echo "not present (no backup was needed)"; fi)"
echo ""
