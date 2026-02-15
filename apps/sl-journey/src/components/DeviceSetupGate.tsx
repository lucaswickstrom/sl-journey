import type { ReactNode } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useDeviceSetup } from "../hooks/useDeviceSetup";
import { DeviceProvider } from "../contexts/DeviceContext";

interface DeviceSetupGateProps {
	children: ReactNode;
}

export function DeviceSetupGate({ children }: DeviceSetupGateProps) {
	const { deviceId, device, isLoading, isRegistered } = useDeviceSetup();

	// Show loading state while checking device status
	if (isLoading) {
		return (
			<View className="flex-1 bg-gray-1 items-center justify-center">
				<ActivityIndicator size="large" color="#888" />
			</View>
		);
	}

	// Redirect to setup if device is not registered
	if (!isRegistered || !device || !deviceId) {
		return <Redirect href="/setup" />;
	}

	// Provide device context to children
	return (
		<DeviceProvider
			value={{
				deviceId,
				device,
				userId: device.userId,
			}}
		>
			{children}
		</DeviceProvider>
	);
}
