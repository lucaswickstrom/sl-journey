import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@sl-journey/convex";
import { useEffect, useState } from "react";
import { getDeviceId } from "../lib/device";

export function useDeviceSetup() {
	const [deviceId, setDeviceId] = useState<string | null>(null);

	// Get native device ID on mount
	useEffect(() => {
		getDeviceId().then(setDeviceId);
	}, []);

	// Query Convex for existing device registration
	const {
		data: device,
		isPending: isCheckingDevice,
		error: checkError,
	} = useQuery({
		...convexQuery(api.devices.getByDeviceId, {
			deviceId: deviceId ?? "",
		}),
		enabled: !!deviceId,
	});

	// Register device mutation - wrap in useMutation for TanStack Query integration
	const mutationFn = useConvexMutation(api.devices.register) as (
		args: { deviceId: string; name: string },
	) => Promise<{ userId: string; deviceId: string }>;
	const registerMutation = useMutation({
		mutationFn,
	});

	return {
		deviceId,
		device,
		isLoading: !deviceId || isCheckingDevice,
		isRegistered: !!device,
		error: checkError,
		register: async (name: string) => {
			if (!deviceId) throw new Error("Device ID not available");
			return registerMutation.mutateAsync({ deviceId, name });
		},
		isRegistering: registerMutation.isPending,
	};
}
