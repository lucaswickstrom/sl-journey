import { createContext, useContext, type ReactNode } from "react";

// Device type matching the Convex schema
export interface Device {
	_id: string;
	_creationTime: number;
	userId: string;
	deviceId: string;
	name: string;
}

interface DeviceContextValue {
	deviceId: string;
	device: Device;
	userId: string;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({
	children,
	value,
}: {
	children: ReactNode;
	value: DeviceContextValue;
}) {
	return (
		<DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
	);
}

export function useDevice() {
	const context = useContext(DeviceContext);
	if (!context) {
		throw new Error("useDevice must be used within DeviceProvider");
	}
	return context;
}
