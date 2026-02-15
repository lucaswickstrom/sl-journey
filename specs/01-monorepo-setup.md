# Spec: Monorepo Setup

## Goal
Set up a pnpm monorepo with TypeScript and Biome for linting/formatting.

## Structure
```
sl-journey/
├── apps/
│   └── sl-journey/          # Expo app (spec 02)
├── packages/
│   ├── ui/                  # Design system (spec 03)
│   ├── convex/              # Convex backend (spec 04)
│   └── sl-aztec-code/       # Aztec barcode library (spec 11)
├── biome.json
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## Acceptance Criteria
- [x] `pnpm-workspace.yaml` exists and defines `apps/*` and `packages/*`
- [x] Root `package.json` has shared scripts and devDependencies
- [x] `biome.json` configured for TypeScript/React
- [x] Root `tsconfig.json` with shared compiler options
- [x] `vitest.config.ts` configured at root
- [x] `pnpm install` runs without errors
- [x] `pnpm lint` runs Biome across all packages
- [x] `pnpm format` formats code with Biome
- [x] `pnpm test` runs Vitest across all packages

## Dependencies
- biome
- typescript
- vitest

## Notes
- Use strict TypeScript settings
- Biome handles both linting and formatting (replaces ESLint + Prettier)
