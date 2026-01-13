# Project Instructions for Claude Code

## Git Branch Workflow

**IMPORTANT**: Always work on the `dev` branch unless explicitly instructed otherwise by the user.

- **DO NOT** create new branches for tasks
- **DO NOT** switch to or create feature branches
- All changes should be committed directly to `dev`
- Only switch branches if the user explicitly requests it

When making changes:
1. Ensure you're on the `dev` branch
2. Make your changes and commit them to `dev`
3. Push to `origin/dev`

The user will handle branch management and merging to `main` when appropriate.

## Environment Setup

This project uses:
- Next.js 15 with TypeScript
- Tailwind CSS
- pnpm as the package manager

The startup hook automatically installs Vercel CLI and GitHub CLI on cloud instances.
