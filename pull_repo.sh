#!/usr/bin/env bash
# pull_repo.sh — Clone a GitHub repository to the current directory.
# Detects an existing installation and delegates to update_repo.sh automatically.
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — set GITHUB_REPO to skip the interactive prompt on future runs.
# Format: "owner/repo-name"  e.g. GITHUB_REPO="myorg/my-app"
# ---------------------------------------------------------------------------
GITHUB_REPO=""

# ---------------------------------------------------------------------------
# Helper: timestamped step / ok / error emitters.
# ---------------------------------------------------------------------------
ts()   { date '+%Y-%m-%d %H:%M:%S'; }
step() { echo "[$(ts)] [STEP $1/$TOTAL_STEPS] $2"; }
ok()   { echo "[$(ts)] [OK]       $1"; }
err()  { echo "[$(ts)] [ERROR]    $1" >&2; exit 1; }
info() { echo "[$(ts)] [INFO]     $1"; }

TOTAL_STEPS=4

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
  info "ADVISORY: To avoid this prompt in future runs, open pull_repo.sh and set"
  info "          GITHUB_REPO=\"${GITHUB_REPO}\" in the configuration block at the top."
  echo ""
fi

[[ "${GITHUB_REPO}" =~ ^[^/]+/[^/]+$ ]] \
  || err "GITHUB_REPO must be in 'owner/repo-name' format. Got: '${GITHUB_REPO}'"

# Derive the local directory name from the repo-name portion after the '/'.
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
# STEP 4 — Clone or delegate to update_repo.sh.
# ---------------------------------------------------------------------------
step 4 "Checking for existing installation"

if [[ -d "${REPO_NAME}" ]]; then
  info "Directory './${REPO_NAME}' already exists — repository is already installed."
  info "Delegating to update_repo.sh for a fresh pull..."
  echo ""

  # Resolve update_repo.sh relative to this script's location so the call
  # works regardless of the caller's working directory.
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  UPDATE_SCRIPT="${SCRIPT_DIR}/update_repo.sh"

  [[ -x "${UPDATE_SCRIPT}" ]] \
    || err "update_repo.sh not found or not executable at: ${UPDATE_SCRIPT}"

  # Pass GITHUB_REPO as an env var so update_repo.sh inherits it without
  # re-prompting, even if its own configuration variable is blank.
  GITHUB_REPO="${GITHUB_REPO}" bash "${UPDATE_SCRIPT}"
  exit $?
fi

info "Cloning ${GITHUB_REPO}..."
gh repo clone "${GITHUB_REPO}" "${REPO_NAME}" \
  || err "Failed to clone '${GITHUB_REPO}'. Verify the repository name and your access permissions."

ok "Repository cloned successfully"
echo ""
echo "  Repository : ${GITHUB_REPO}"
echo "  Location   : $(pwd)/${REPO_NAME}"
echo ""
