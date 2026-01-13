#!/bin/bash
# Install Vercel CLI globally if not already installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
else
    echo "Vercel CLI already installed"
fi

# Verify VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "WARNING: VERCEL_TOKEN environment variable is not set"
    echo "Please set it in your Claude Code settings or system environment"
else
    echo "VERCEL_TOKEN is configured"
fi
