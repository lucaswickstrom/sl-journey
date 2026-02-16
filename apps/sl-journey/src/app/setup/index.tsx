import { useState } from "react";
import {
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Button, VStack, Card, gray, Text } from "../../ui";
import { useDeviceSetup } from "../../hooks/useDeviceSetup";

export default function SetupScreen() {
  const { t } = useTranslation("SetupScreen");
  const [deviceName, setDeviceName] = useState("");
  const { register, isRegistering } = useDeviceSetup();

  const handleContinue = async () => {
    try {
      await register(deviceName.trim());
      router.replace("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const isValid = deviceName.trim().length > 0;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Pressable className="flex-1" onPress={Keyboard.dismiss}>
        <VStack className="flex-1 justify-center px-6 gap-6">
        <VStack className="gap-2">
          <Text className="text-3xl font-bold text-center">{t("title")}</Text>
          <Text className="text-gray-11 text-center">{t("subtitle")}</Text>
        </VStack>

        <Card className="p-4">
          <VStack className="gap-3">
            <Text className="text-sm text-gray-11">{t("deviceNameLabel")}</Text>
            <TextInput
              className="bg-gray-a3 rounded-lg px-4 py-3 text-base min-h-14"
              style={{ color: gray[12] }}
              placeholder={t("deviceNamePlaceholder")}
              placeholderTextColor={gray[9]}
              value={deviceName}
              onChangeText={setDeviceName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={isValid ? handleContinue : undefined}
            />
          </VStack>
        </Card>

        <Button onPress={handleContinue} disabled={!isValid || isRegistering}>
          {isRegistering ? t("registering") : t("continue")}
        </Button>
        </VStack>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
