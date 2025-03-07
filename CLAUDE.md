# Empire Project Reference Guide

## Build & Test Commands
- Dev: `pnpm --filter=<workspace> dev`
- Build: `pnpm --filter=<workspace> build`
- Lint: `pnpm lint` or `pnpm lint:eslint:fix` 
- Typecheck: `pnpm --filter=<workspace> typecheck`
- Test single file: `vitest run <path-to-test-file>`
- Firebase Emulators: `pnpm emulators`

## Code Style
- Indentation: 2 spaces
- Quotes: Single quotes
- No semicolons
- TypeScript with inline type imports: `import type { X } from 'y'`
- Vue components: Multi-word names, max 2 attributes per line
- Tailwind classes: Must use proper order (enforced)
- Error handling: Use typed error objects, avoid generic catches

## Architecture
- Monorepo with workspaces in `layers/*` and `workspaces/*`
- Nuxt.js-based application modules
- Firebase backend
- Follow existing patterns for new components/files