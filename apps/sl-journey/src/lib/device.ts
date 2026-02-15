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
