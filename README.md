# SL Journey App

A React Native (Expo 55) app in a pnpm monorepo that shows SL trips based on user location, with shared Aztec ticket functionality.

## Core Features
1. **Location-based departures**: Auto-show relevant trains based on proximity to stations
2. **Geofences**: Home, work, or custom locations with preset destinations
3. **Pinned trips**: Favorite specific lines/destinations
4. **Shared Aztec tickets**: Multi-device ticket sharing with usage-based locking

## Tech Stack
- **Monorepo**: pnpm workspaces
- **Mobile**: React Native + Expo 55 (dark mode only)
- **Backend/Sync**: Convex
- **Styling**: Uniwind (Tailwind for RN)
- **Design**: Radix gray dark scale
- **Storage**: MMKV
- **Linting**: Biome
- **Auth**: Anonymous + device-based (Convex auth)
- **APIs**: Trafiklab/SL APIs

## Specs (Implementation Order)

| # | Spec | Description |
|---|------|-------------|
| 1 | [Monorepo Setup](specs/01-monorepo-setup.md) | pnpm workspace, TypeScript, Biome |
| 2 | [Expo App Setup](specs/02-expo-app-setup.md) | Expo 55, Router, Uniwind, MMKV |
| 3 | [Design System](specs/03-design-system.md) | Radix gray dark scale, SL colors |
| 4 | [Convex Backend](specs/04-convex-backend-setup.md) | Schema, auth, queries/mutations |
| 5 | [Trafiklab API](specs/05-trafiklab-api.md) | Station data, departures via Convex |
| 6 | [Device Setup](specs/06-device-setup.md) | First launch flow, device naming |
| 7 | [Geofences](specs/07-geofences.md) | Custom locations with destinations |
| 8 | [Pinned Trips](specs/08-pinned-trips.md) | Favorite lines/destinations |
| 9 | [Home Screen](specs/09-home-screen.md) | Departures based on location |
| 10 | [SL Ticket API](specs/10-sl-ticket-api.md) | Auth, tickets, device keys |
| 11 | [SL Aztec Code](specs/11-sl-aztec-code.md) | Barcode generate/decode/verify |
| 12 | [Shared Tickets](specs/12-shared-tickets.md) | Aztec ticket sharing |

## User Prerequisites
- Trafiklab API key: https://www.trafiklab.se/
- Convex account: https://convex.dev/

## Quick Start
```bash
pnpm install
pnpm -F sl-journey start  # Start Expo
pnpm -F convex dev      # Start Convex
```
