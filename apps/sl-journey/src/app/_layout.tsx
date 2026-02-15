import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { ConvexProvider } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { convex, convexQueryClient } from "../lib/convex";
import { persister, queryClient } from "../lib/query-client";
import "../lib/i18n";
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
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ConvexProvider client={convex}>
				<PersistQueryClientProvider
					client={queryClient}
					persistOptions={{ persister }}
				>
					<StatusBar style="light" />
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="setup" options={{ gestureEnabled: false }} />
						<Stack.Screen
							name="error-sheet"
							options={{
								presentation: "formSheet",
								sheetGrabberVisible: true,
								sheetCornerRadius: 16,
							}}
						/>
					</Stack>
				</PersistQueryClientProvider>
			</ConvexProvider>
		</GestureHandlerRootView>
	);
}
