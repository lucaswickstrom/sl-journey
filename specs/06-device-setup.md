# Spec: Device Setup

## Goal
Handle first-time app launch: generate device ID, prompt user for device name, and register with backend.

## Flow
1. App launches
2. Get device ID using `expo-application` (native API, always available)
3. Query Convex to check if device is registered
4. If device not registered:
   - Show device name input screen
   - User enters device name (e.g., "Lucas's iPhone")
   - Register device with Convex (creates user if needed)
5. If device registered:
   - Proceed to home screen

## Structure
```
apps/sl-journey/src/
├── app/
│   └── setup/
│       └── index.tsx        # Device name input screen
├── hooks/
│   └── useDeviceSetup.ts    # Setup flow logic
├── lib/
│   └── device.ts            # Device ID generation
```

## UI Components

### Setup Screen
- Welcome message
- Text input for device name
- "Continue" button (disabled until name entered)
- Auto-suggest device name from device model (optional)

## Device ID Generation

Device ID is retrieved from native APIs via `expo-application`. No local storage needed since the native ID is always available.

```typescript
// src/lib/device.ts
import * as Application from "expo-application";
import { Platform } from "react-native";

export async function getDeviceId(): Promise<string> {
  if (Platform.OS === "ios") {
    const id = await Application.getIosIdForVendorAsync();
    if (!id) throw new Error("Failed to get iOS device ID");
    return id;
  }
  const id = Application.getAndroidId();
  if (!id) throw new Error("Failed to get Android device ID");
  return id;
}
```

## Convex Mutation
```typescript
// convex/devices.ts
export const register = mutation({
  args: {
    deviceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if device already exists
    const existing = await ctx.db
      .query("devices")
      .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
      .first();

    if (existing) {
      return existing;
    }

    // Create new user for this device
    const userId = await ctx.db.insert("users", {});

    // Create device
    const device = await ctx.db.insert("devices", {
      userId,
      deviceId: args.deviceId,
      name: args.name,
    });

    return { userId, deviceId: args.deviceId };
  },
});
```

## Acceptance Criteria
- [ ] Device ID retrieved from native API on launch
- [ ] Setup screen shows for unregistered devices (checked via Convex)
- [ ] User can enter custom device name
- [ ] Device registered in Convex with name
- [ ] User created automatically during device registration
- [ ] Subsequent launches skip setup screen (device exists in Convex)
- [ ] Device name editable in settings (future)

## Notes
- First device creates a new user; additional devices can join an existing user (future: invite/link flow)
- Multiple devices per user enables cross-device sync for geofences, pinned trips, etc.
- Device name is for display in ticket usage ("Used by Lucas's iPhone")
- Consider pre-filling device name with device model
