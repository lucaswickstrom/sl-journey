# Spec: Pinned Trips

## Goal
Allow users to pin favorite lines/destinations for quick access on the home screen.

## Features
1. Pin a trip (line + from/to stations)
2. View pinned trips prominently on home screen
3. Unpin trips
4. Manage pinned trips list

## UI Components
- **Pin button**: On departure cards
- **Pinned trips section**: Top of home screen
- **Manage pins**: Settings or dedicated screen

## Structure
```
apps/sl-journey/src/
├── app/
│   └── pinned/
│       └── index.tsx        # Manage pinned trips
├── components/
│   ├── PinButton.tsx
│   └── PinnedTripCard.tsx
├── hooks/
│   └── usePinnedTrips.ts
```

## Acceptance Criteria
- [ ] Pin a trip from departure card (tap pin icon)
- [ ] Pinned trips appear at top of home screen
- [ ] Show real-time departures for pinned trips
- [ ] Unpin trip (tap pin icon again)
- [ ] Manage all pinned trips in dedicated screen
- [ ] Reorder pinned trips (drag and drop)
- [ ] Synced to Convex (available on all devices)
- [ ] Maximum 10 pinned trips (prevent clutter)

## Data Model
```typescript
{
  userId: Id<"users">
  lineNumber: string      // e.g., "14" for bus 14
  fromStation: string     // Station ID
  toStation: string       // Station ID (direction)
  order: number           // Sort order (lower = higher priority)
}
```

## Reordering Logic
- New pins get `order = max(existing orders) + 1`
- Drag-and-drop updates order values for affected items
- Use optimistic updates for smooth UX

## Notes
- Pinned trips show departures even when not near the station
- Consider showing "no departures" for pinned trips outside operating hours
