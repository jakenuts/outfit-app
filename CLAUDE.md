# Instructions for Claude Code

## Git Branch Workflow - CRITICAL

**ALWAYS work on the `dev` branch unless explicitly instructed otherwise.**

- ❌ **DO NOT** create new branches for tasks
- ❌ **DO NOT** switch to feature branches automatically
- ✅ **DO** work directly on the `dev` branch
- ✅ **DO** commit all changes to `dev`
- ✅ **DO** push to `origin/dev`

When starting work:
1. Verify you're on `dev` branch: `git branch`
2. If not on dev, switch: `git checkout dev`
3. Make your changes
4. Commit to `dev`
5. Push to `origin/dev`

**The user will handle merging to `main` manually.**

## Project Info

- Framework: Next.js 15 with TypeScript
- Styling: Tailwind CSS
- Package Manager: pnpm
- Vercel CLI is auto-installed via startup hook
