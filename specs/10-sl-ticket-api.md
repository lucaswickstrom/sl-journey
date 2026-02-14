# Spec: SL Ticket API

## Goal
Integrate with SL's ticket API for authentication, ticket retrieval, and device key management.

## APIs
- **Authentication**: JWT token via appToken
- **Tickets**: Retrieve active tickets with MTB data
- **Device Key**: Create/refresh device keys for ticket signing

## Structure
```
apps/sl-journey/src/lib/
├── slApi.ts                 # API client and endpoints
└── deviceStorage.ts         # Device credential storage
```

## Acceptance Criteria
- [ ] JWT authentication with auto-refresh
- [ ] Fetch active tickets with MTB data
- [ ] Create/refresh device keys
- [ ] React Query integration with 5-minute refresh
- [ ] JWT token persisted to MMKV

## Configuration
```typescript
const BASE_URL = "https://sl-app-api.prod.tap.sl.se";
const APP_VERSION = "8.3.0";
const PLATFORM = "IOS";
const USER_AGENT = "Biljettappen-iOS/13766";
```

## API Client Setup
```typescript
// src/lib/slApi.ts
import { queryOptions } from "@tanstack/react-query";
import { MMKV } from "react-native-mmkv";
import { ky } from "@/lib/ky";

const storage = new MMKV({ id: "sl-api" });

// appToken is fetched from Convex tickets table
export function createSlApi(appToken: string) {
  let jwtToken = storage.getString("sl_jwt_token");

  return ky.create({
    prefixUrl: BASE_URL,
    hooks: {
      beforeRequest: [
        async (request) => {
          request.headers.set("User-Agent", USER_AGENT);

          // Auto-refresh JWT if expired
          if (!jwtToken || isJWTExpired(jwtToken)) {
            const response = await ky.post(`${BASE_URL}/v1/auth/jwt`, {
              json: { appVersion: APP_VERSION, platform: PLATFORM, appToken },
            }).json<{ jwt: string }>();

            jwtToken = response.jwt;
            storage.set("sl_jwt_token", response.jwt);
          }

          request.headers.set("Authorization", `Bearer ${jwtToken}`);
        },
      ],
    },
  });
}
```

## Endpoints

### POST /v1/auth/jwt
Authenticate and get JWT token (valid ~24 hours).
```typescript
interface AuthResponse {
  jwt: string;
  expiresAt: string; // ISO 8601
}
```

### GET /v1/ticket
Get all active tickets with MTB data.
```typescript
interface TicketBundle {
  id: string;
  mtb: string; // Mobile Ticket Barcode
  validity: { from: string; to: string };
  displayText: { productName: { display: string } };
  displayValidThru: string;
  loanQuota: { remaining: number; total: number };
}
```

### POST /v1/device-key
Create device key for ticket signing (expires in 14 days, refresh daily).
```typescript
interface DeviceKeyResponse {
  deviceKey: string; // Base64 encoded
  keyId: string;
  expiresAt: string;
  refreshAt: string;
}
```

## React Query Integration
```typescript
export function getConfigQueryOptions(deviceKey: string) {
  return queryOptions({
    queryKey: ["slConfig", deviceKey],
    queryFn: async (): Promise<SLTicketConfig> => {
      const [deviceKeyResponse, ticketsResponse] = await Promise.all([
        createDeviceKey(),
        getTickets(),
      ]);

      return {
        ticketId: ticket.id,
        deviceKey: deviceKeyResponse.deviceKey,
        keyId: deviceKeyResponse.keyId,
        deviceId: device.deviceId,
        appId: "11",
        mtb: ticket.mtb,
        algorithm: "HS256",
        displayValidThrough: ticket.displayValidThru,
        ticketType: ticket.displayText.productName.display,
      };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Dependencies
- react-native-mmkv (JWT storage)
- ky (HTTP client)
- @tanstack/react-query

## Notes
- SL Ticket API uses automatic JWT refresh via ky hooks
- Device keys should be refreshed daily (before refreshAt)
- JWT tokens are per-device and stored with device-specific keys
- `appToken` is stored in Convex tickets table (prefilled in database)
