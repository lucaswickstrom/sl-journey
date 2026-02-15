import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { convex, convexQueryClient } from "../lib/convex";
import { persister, queryClient } from "../lib/query-client";
import "../global.css";

// Configure TanStack Query with Convex
queryClient.setDefaultOptions({
	queries: {
		queryKeyHashFn: convexQueryClient.hashFn(),
		queryFn: convexQueryClient.queryFn(),
	},
});

export default function RootLayout() {
	return (
		<ConvexProvider client={convex}>
			<PersistQueryClientProvider
				client={queryClient}
				persistOptions={{ persister }}
			>
				<StatusBar style="light" />
				<Stack
					screenOptions={{
						headerStyle: { backgroundColor: "#111111" },
						headerTintColor: "#eeeeee",
						contentStyle: { backgroundColor: "#111111" },
					}}
				>
					<Stack.Screen name="index" options={{ title: "SL Journey" }} />
					<Stack.Screen
						name="error-sheet"
						options={{
							presentation: "formSheet",
							sheetGrabberVisible: true,
							sheetCornerRadius: 16,
							headerShown: false,
						}}
					/>
				</Stack>
			</PersistQueryClientProvider>
		</ConvexProvider>
	);
}
