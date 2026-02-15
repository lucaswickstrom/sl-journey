import { MMKV } from "react-native-mmkv";

// Query cache storage
export const queryCacheStorage = new MMKV({ id: "query-cache" });

// SL API credentials storage
export const slApiStorage = new MMKV({ id: "sl-api" });
