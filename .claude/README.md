# Claude Code Configuration

This directory contains startup hooks and configuration for Claude Code cloud instances.

## Startup Hook

The `startup.sh` script automatically:
- Installs Vercel CLI globally if not present
- Installs GitHub CLI globally if not present
- Verifies that VERCEL_TOKEN is set

## Environment Variables

You need to set the following environment variable in your Claude Code settings:

**VERCEL_TOKEN** - Your Vercel authentication token
**GH_TOKEN** (optional) - GitHub CLI authentication token

### How to Set Environment Variables in Claude Code

1. Open Claude Code Settings (Cmd/Ctrl + ,)
2. Search for "environment variables"
3. Add: `VERCEL_TOKEN=<your-token-here>`

Or set it in your system environment before launching Claude Code.

## Files

- `startup.sh` - Bash script that runs when cloud instances start
- `settings.json` - Hook configuration that triggers the startup script
