import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "@sl-journey/ui";

export default function HomeScreen() {
  const { t } = useTranslation("HomeScreen");

  return (
    <View className="flex-1 items-center justify-center bg-gray-1">
      <Text className="text-gray-12 text-xl">{t("title")}</Text>
      <Text className="text-gray-11 mt-2">{t("subtitle")}</Text>
    </View>
  );
}
