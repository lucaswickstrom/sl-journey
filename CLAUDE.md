# SL Journey - Project Conventions

## Project Overview

Stockholm transit app built with Expo 55 (React Native), Convex backend, and TanStack Query.

## Architecture

- **Monorepo**: pnpm workspaces with `apps/*` and `packages/*`
- **App**: `apps/sl-journey` - Expo 55 with Expo Router
- **Backend**: `packages/convex` - Convex for real-time data
- **UI**: `packages/ui` - Shared design system
- **Aztec**: `packages/sl-aztec-code` - Ticket barcode generation

## Coding Conventions

### Naming

- Timestamp fields use `At` suffix: `arrivedAt`, `expiresAt`, `refreshAt`, `createdAt`
- Boolean fields use `is`/`has` prefix: `isLocked`, `hasAccess`

### Timestamps

- Store as ISO 8601 strings with offset: `2024-01-15T14:30:00+01:00`
- Use Convex `_creationTime` when possible instead of custom timestamp fields

### Styling

- Dark mode only (no light mode support)
- Use Uniwind for Tailwind styling (faster than NativeWind)
- Prefer Radix gray alpha scale for UI elements (grayA)

### Data Fetching

- Use `@tanstack/react-query` for all async operations
- Use `ky` for HTTP requests (not fetch or axios)
- Persist queries to MMKV storage

### Error Handling

- Global error form sheet for background refetch errors
- `throwOnError` for server errors (5xx) to error boundaries
- Local error state for inline handling

## Key Dependencies

- expo ~55.0.0
- convex with @convex-dev/react-query
- @tanstack/react-query
- react-native-mmkv
- ky
- uniwind

## Specs

Implementation specs are in `specs/` directory.

IMPORTANT: When making changes to the codebase, update the relevant specs to keep them in sync (schema, file structure, acceptance criteria, etc.).
