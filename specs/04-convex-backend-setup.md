# Spec: Convex Backend Setup

## Goal
Initialize Convex with schema, anonymous auth, and basic queries/mutations.

## Structure
```
packages/convex/
├── convex/
│   ├── schema.ts
│   ├── users.ts
│   ├── devices.ts
│   ├── tickets.ts
│   ├── ticketUsages.ts
│   ├── geofences.ts
│   ├── pinnedTrips.ts
│   └── _generated/
└── package.json
```

## Schema

### users
- (created automatically on first device registration, fields reserved for future use)

### devices
- `userId`: reference to users (indexed)
- `deviceId`: string (indexed, unique device identifier)
- `name`: string (user-provided device name, e.g., "Lucas's iPhone")

### tickets
- `id`: string (SL ticket ID)
- `appToken`: string (SL API authentication token)
- `name`: string (display name for the ticket)

### ticketUsages
- `ticketId`: reference to tickets (indexed)
- `deviceId`: string (indexed)
- `location`: { lat: number, lng: number }

Note: Use Convex's built-in `_creationTime` for usage timestamp.

Note: Client calculates if a ticket is locked based on ticketUsages. A ticket is considered locked for a device if another device has a recent usage (e.g., within the last hour).

### geofences
- `userId`: reference to users (indexed)
- `name`: string
- `points`: array of { lat, lng } (1 point = circle, N points = path)
- `radius`: number (buffer distance in meters)
- `destinations`: array of { stationId, stationName }

### pinnedTrips
- `userId`: reference to users (indexed)
- `lineNumber`: string
- `fromStation`: string
- `toStation`: string
- `order`: number (for sorting, lower = higher priority)

## Acceptance Criteria
- [x] Convex project initialized
- [x] Schema defined with all tables and indexes
- [x] Anonymous auth configured with device ID (via device registration flow)
- [x] Basic CRUD mutations for each table
- [x] Basic queries for each table
- [x] `pnpm -F @sl-journey/convex dev` starts Convex dev server
- [x] Mobile app connects to Convex successfully
- [x] User created on first app launch with device ID

## Dependencies
- convex
- @convex-dev/react-query (TanStack Query integration)

## TanStack Query Integration

Use `@convex-dev/react-query` for Convex queries with TanStack Query:

```typescript
// lib/convex.ts
import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";

export const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);
export const convexQueryClient = new ConvexQueryClient(convex);
```

```tsx
// app/_layout.tsx
import { ConvexProvider } from "convex/react";
import { convex, convexQueryClient } from "../lib/convex";

// Add convexQueryClient to queryClient
queryClient.setDefaultOptions({
  queries: {
    queryKeyHashFn: convexQueryClient.hashFn(),
    queryFn: convexQueryClient.queryFn(),
  },
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <PersistQueryClientProvider ...>
        <Stack />
      </PersistQueryClientProvider>
    </ConvexProvider>
  );
}
```

```tsx
// Usage in components
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@sl-journey/convex";

function MyComponent() {
  const { data } = useQuery(convexQuery(api.users.get, { deviceId }));
}
```

## Data Model Diagram

```
┌─────────────┐
│   users     │
│─────────────│
│ _id         │◄─────────────────────────────────┐
│ (empty)     │                                  │
└─────────────┘                                  │
       ▲                                         │
       │ userId                                  │ userId
       │                                         │
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   devices   │      │   tickets   │      │  geofences  │
│─────────────│      │─────────────│      │─────────────│
│ _id         │      │ _id         │      │ _id         │
│ userId      │      │ id          │      │ userId      │
│ deviceId    │◄──┐  │ appToken    │      │ name        │
│ name        │   │  │ name        │      │ points[]    │
└─────────────┘   │  └─────────────┘      │ radius      │
                  │         ▲             │ destinations│
                  │         │ ticketId    └─────────────┘
                  │         │
                  │  ┌──────┴──────┐      ┌─────────────┐
                  │  │ticketUsages │      │ pinnedTrips │
                  │  │─────────────│      │─────────────│
                  │  │ _id         │      │ _id         │
                  └──│ deviceId    │      │ userId      │
                     │ ticketId    │      │ lineNumber  │
                     │ location    │      │ fromStation │
                     │ _creationTime│     │ toStation   │
                     └─────────────┘      │ order       │
                                          └─────────────┘
```

**Relationships:**
- Each **device** belongs to one **user** (created during device registration)
- **Tickets** are global (shared by all devices) - no userId, prefilled in database
- **ticketUsages** links a device to a ticket usage event
- **Geofences** and **pinnedTrips** belong to a user (synced across user's devices)

## Notes
- Device ID should be generated and stored in MMKV
- Use `@convex-dev/react-query` for TanStack Query integration
- Tickets are prefilled in database (no in-app ticket creation)
- Users are created during device registration (spec 09)
- All devices share the same global tickets
- Client-side lock calculation based on ticketUsages from other devices
- All timestamps stored as ISO 8601 strings with offset (e.g., `2024-01-15T14:30:00+01:00`)
