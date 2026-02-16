import { Stack } from "expo-router";
import { gray } from "../../ui/colors";

export default function SetupLayout() {
	return (
		<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: gray[1] } }}>
			<Stack.Screen name="index" />
		</Stack>
	);
}
