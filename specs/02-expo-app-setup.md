# Spec: Expo App Setup

## Goal
Create an Expo 55 app with Expo Router, Uniwind styling, MMKV storage, and location services.

## Structure
```
apps/sl-journey/
├── src/
│   ├── app/                 # Expo Router (file-based routing)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── locales/             # i18n translation files
│       └── en.json
├── assets/
├── app.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Acceptance Criteria
- [x] Expo 54 app created with `create-expo-app` (Expo 55 still in preview)
- [x] Expo Router configured with file-based routing
- [x] Uniwind (Tailwind for RN) configured
- [x] MMKV configured for local storage
- [x] `expo-location` installed and permissions configured
- [x] `pnpm -F @sl-journey/app start` launches Expo dev server
- [x] App runs on iOS simulator
- [x] Basic screen renders with Tailwind styles

## Dependencies
- expo ~55.0.0
- expo-router
- expo-location
- expo-application (device ID)
- uniwind + tailwindcss
- react-native-mmkv
- react-native-maps (map component)
- react-native-reanimated (animations)
- react-native-gesture-handler (gestures)
- ky (HTTP client)
- @tanstack/react-query (async state management)
- @tanstack/react-query-persist-client (query persistence)
- pressto (button press feedback)
- i18next + react-i18next (internationalization)

## HTTP Client Setup

Use `ky` as the base HTTP client with error logging in dev mode.

```typescript
// src/lib/ky.ts
import kyBase from "ky";

export const ky = kyBase.extend({
  hooks: {
    beforeError: __DEV__
      ? [
          (error) => {
            console.debug(error);
            return error;
          },
        ]
      : [],
  },
});
```

## React Query Setup

Use `@tanstack/react-query` for all async operations:

```typescript
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { MMKV } from "react-native-mmkv";

const storage = new MMKV({ id: "query-cache" });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
    },
  },
});

export const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
});
```

```tsx
// src/app/_layout.tsx
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persister } from "@/lib/query-client";

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <Stack />
    </PersistQueryClientProvider>
  );
}
```

## i18n Setup

Use `i18next` with `react-i18next` for translations. English only. Namespaces are named after components.

```typescript
// src/lib/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    en,
  },
  lng: "en",
  fallbackLng: "en",
  defaultNS: "common",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

```json
// src/locales/en.json
{
  "common": {
    "loading": "Loading...",
    "retry": "Retry"
  },
  "HomeScreen": {
    "title": "SL Journey",
    "subtitle": "Stockholm Transit Companion"
  }
}
```

Type-safe keys via module augmentation:

```typescript
// src/types/i18n.d.ts
import "i18next";
import type en from "../locales/en.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: typeof en;
  }
}
```

Import i18n in the root layout to initialize:

```tsx
// src/app/_layout.tsx
import "@/lib/i18n";
```

Use translations in components with component name as namespace:

```tsx
import { useTranslation } from "react-i18next";

function HomeScreen() {
  const { t } = useTranslation("HomeScreen");
  return <Text>{t("title")}</Text>;
}
```

## Error Handling

Use a combination of strategies based on [TkDodo's error handling guide](https://tkdodo.eu/blog/react-query-error-handling):

### Global Error Form Sheet

Show a form sheet for background refetch errors using Expo Router's modal presentation:

```typescript
// src/lib/query-client.ts
import { QueryClient, QueryCache } from "@tanstack/react-query";
import { router } from "expo-router";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show sheet for background refetches (when we have stale data)
      if (query.state.data !== undefined) {
        router.push({
          pathname: "/error-sheet",
          params: { message: error.message },
        });
      }
    },
  }),
  // ... defaultOptions
});
```

```tsx
// src/app/error-sheet.tsx
import { useLocalSearchParams, router } from "expo-router";

export default function ErrorSheet() {
  const { message } = useLocalSearchParams<{ message: string }>();

  return (
    <View className="flex-1 justify-end">
      <View className="bg-gray-2 rounded-t-xl p-4">
        <Text className="text-gray-12 text-center text-lg mb-2">
          Something went wrong
        </Text>
        <Text className="text-gray-11 text-center mb-4">{message}</Text>
        <Button onPress={() => router.back()}>
          <ButtonText>Dismiss</ButtonText>
        </Button>
      </View>
    </View>
  );
}
```

```tsx
// src/app/_layout.tsx
<Stack>
  <Stack.Screen name="index" />
  <Stack.Screen
    name="error-sheet"
    options={{
      presentation: "formSheet",
      sheetGrabberVisible: true,
      sheetCornerRadius: 16,
    }}
  />
</Stack>
```

### Error Boundaries for Server Errors

Use `throwOnError` to propagate server errors (5xx) to error boundaries while handling client errors (4xx) locally:

```tsx
useQuery({
  queryKey: ["departures", stationId],
  queryFn: fetchDepartures,
  throwOnError: (error) => error.status >= 500,
});
```

### Local Error State

For inline error handling when you need custom UI:

```tsx
const { data, error, isLoading } = useQuery(...);

if (error) {
  return <ErrorMessage message={error.message} onRetry={refetch} />;
}
```

## Device ID

Use native device identifiers via `expo-application`:

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

See [spec 06 (Device Setup)](./06-device-setup.md) for the device registration flow.

## Offline Support

The app uses MMKV for persistent local storage, enabling offline functionality:

- **Query cache**: React Query results persisted via `@tanstack/query-sync-storage-persister`
- **Credentials**: JWT tokens, API keys stored in MMKV
- **Graceful degradation**: Cached departures/stations shown when offline

```typescript
// src/lib/storage.ts
import { MMKV } from "react-native-mmkv";

// Query cache storage
export const queryCacheStorage = new MMKV({ id: "query-cache" });

// SL API credentials storage
export const slApiStorage = new MMKV({ id: "sl-api" });
```

## Notes
- Dark mode only (no light mode support)
- Use Uniwind over NativeWind (2x faster)
- Configure location permissions in app.json for iOS/Android
- Use `ky` for all HTTP requests (cleaner API than fetch, smaller than axios)
- Use `@tanstack/react-query` for all async operations, persisted to MMKV
- Set `userInterfaceStyle: "dark"` in app.json
- iOS: Device ID resets if user uninstalls all apps from same vendor
- Android: Device ID persists across reinstalls
