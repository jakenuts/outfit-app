#!/bin/bash

log() {
    echo "[startup] $*"
}

ensure_vercel_cli() {
    if command -v vercel &> /dev/null; then
        log "Vercel CLI already installed"
        return 0
    fi

    if ! command -v npm &> /dev/null; then
        log "WARNING: npm is not available; cannot install Vercel CLI"
        return 1
    fi

    log "Installing Vercel CLI..."
    npm install -g vercel
}

ensure_github_cli() {
    if command -v gh &> /dev/null; then
        log "GitHub CLI already installed"
        return 0
    fi

    if ! command -v apt-get &> /dev/null; then
        log "WARNING: apt-get not available; cannot install GitHub CLI"
        return 1
    fi

    local apt_prefix=()
    if [ "$(id -u)" -ne 0 ]; then
        if command -v sudo &> /dev/null; then
            apt_prefix=(sudo)
        else
            log "WARNING: Need root privileges to install GitHub CLI"
            return 1
        fi
    fi

    log "Installing GitHub CLI..."
    DEBIAN_FRONTEND=noninteractive "${apt_prefix[@]}" apt-get update
    DEBIAN_FRONTEND=noninteractive "${apt_prefix[@]}" apt-get install -y gh
}

ensure_vercel_cli
ensure_github_cli

# Verify VERCEL_TOKEN is set
if [ -z "${VERCEL_TOKEN:-}" ]; then
    log "WARNING: VERCEL_TOKEN environment variable is not set"
    log "Please set it in your Claude Code settings or system environment"
else
    log "VERCEL_TOKEN is configured"
fi
