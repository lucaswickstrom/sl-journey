import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "../ui";
import { DeviceSetupGate } from "../components/DeviceSetupGate";
import { useDevice } from "../contexts/DeviceContext";

function HomeContent() {
	const { t } = useTranslation("HomeScreen");
	const { device } = useDevice();

	return (
		<View className="flex-1 items-center justify-center bg-gray-1">
			<Text className="text-gray-12 text-xl">{t("title")}</Text>
			<Text className="text-gray-11 mt-2">{t("subtitle")}</Text>
			<Text className="text-gray-10 mt-4 text-sm">{device.name}</Text>
		</View>
	);
}

export default function HomeScreen() {
	return (
		<DeviceSetupGate>
			<HomeContent />
		</DeviceSetupGate>
	);
}
