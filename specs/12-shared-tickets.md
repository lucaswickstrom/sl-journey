# Spec: Shared Tickets

## Goal
Enable users to share Aztec tickets with location-based availability and client-side lock calculation.

## Features
1. View available tickets (prefilled in database)
2. Check-in to use a ticket (records usage)
3. Display Aztec barcode when checked in
4. Client calculates lock status based on other devices' usage

## UI Components
- **Ticket list**: All tickets with availability status
- **Ticket detail**: Aztec barcode display
- **Check-in button**: Use ticket at station

## Structure
```
apps/sl-journey/src/
├── app/
│   └── tickets/
│       ├── index.tsx        # List tickets
│       └── [id].tsx         # Ticket detail/barcode
├── components/
│   ├── TicketCard.tsx
│   └── CheckInButton.tsx
├── hooks/
│   ├── useTickets.ts
│   └── useTicketCheckIn.ts
```

## Acceptance Criteria
- [ ] View all tickets (prefilled in database)
- [ ] See ticket availability status (available/in use by another device)
- [ ] Check-in to a ticket when at station
- [ ] Display full-screen Aztec barcode when checked in
- [ ] Client calculates lock status from ticketUsages
- [ ] Maximum lock duration: 1 hour
- [ ] Show estimated availability time based on usage timestamp
- [ ] Undo ticket usage within 5 minutes of check-in
- [ ] Only the device that created the usage can undo it
- [ ] Undo button hidden after 5-minute window expires

## Check-in Flow
1. User taps "Use Ticket" on available ticket
2. System records ticketUsage: deviceId, location (timestamp via Convex `_creationTime`)
3. User sees Aztec barcode full-screen
4. Other devices see ticket as locked (client-side calculation)

## Undo Ticket Usage
Users can undo a ticket usage within 5 minutes of creating it. This allows recovery from accidental check-ins.

### Rules
- Only the device that created the usage can undo it
- Undo window: 5 minutes from `_creationTime`
- Undo deletes the ticketUsage record
- After undo, ticket becomes available again immediately

### UI
- Show "Undo" button on ticket detail screen when usage is undoable
- Button hidden after 5 minutes
- Confirmation dialog before undo

### Convex Mutation
```typescript
// convex/ticketUsages.ts
export const undo = mutation({
  args: {
    usageId: v.id("ticketUsages"),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db.get(args.usageId);
    if (!usage) {
      throw new Error("Usage not found");
    }

    // Verify device ownership
    if (usage.deviceId !== args.deviceId) {
      throw new Error("Only the device that created this usage can undo it");
    }

    // Check 5-minute window
    const undoWindowMs = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    if (now - usage._creationTime > undoWindowMs) {
      throw new Error("Undo window has expired");
    }

    await ctx.db.delete(args.usageId);
    return { success: true };
  },
});
```

### Client Helper
```typescript
function isUsageUndoable(
  usage: TicketUsage,
  currentDeviceId: string,
  undoWindowMs: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  if (usage.deviceId !== currentDeviceId) {
    return false;
  }
  const now = Date.now();
  return now - usage._creationTime < undoWindowMs;
}
```

## Lock Calculation (Client-Side)
```typescript
function isTicketLocked(
  ticketUsages: TicketUsage[],
  currentDeviceId: string,
  maxLockDuration: number = 60 * 60 * 1000 // 1 hour
): { locked: boolean; lockedByDeviceId?: string; availableAt?: Date } {
  const now = Date.now();

  // Find the most recent usage by another device (using Convex _creationTime)
  const otherDeviceUsage = ticketUsages
    .filter(usage => usage.deviceId !== currentDeviceId)
    .sort((a, b) => b._creationTime - a._creationTime)[0];

  if (!otherDeviceUsage) {
    return { locked: false };
  }

  const lockExpiresAt = otherDeviceUsage._creationTime + maxLockDuration;

  if (now < lockExpiresAt) {
    return {
      locked: true,
      lockedByDeviceId: otherDeviceUsage.deviceId,
      availableAt: new Date(lockExpiresAt),
    };
  }

  return { locked: false };
}
```

## Aztec Barcode Display

Use the `AztecBarcode` component from spec 11 (SL Aztec Code):

```tsx
import { AztecBarcode } from "@/components/AztecBarcode";
import type { GeneratorConfig } from "@sl-journey/sl-aztec-code";

// In ticket detail screen
<AztecBarcode
  config={ticketConfig}
  barcolor="000000"
/>
```

See [spec 11 (SL Aztec Code)](./11-sl-aztec-code.md) for full implementation details including:
- Rolling code generation with device signing
- 5-second refresh interval
- Screen brightness control

## Dependencies
- @sl-journey/sl-aztec-code (Aztec barcode generation - spec 11)

## Security Notes
- appToken stored in Convex (prefilled)
- Only display barcode to checked-in user
- Consider ticket expiry dates

## Notes
- All devices share the same tickets (no household grouping)
- Lock status calculated client-side from ticketUsages
- ticketUsages synced via Convex real-time
