import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { queryCacheStorage } from "./storage";

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
		getItem: (key) => queryCacheStorage.getString(key) ?? null,
		setItem: (key, value) => queryCacheStorage.set(key, value),
		removeItem: (key) => queryCacheStorage.delete(key),
	},
});
