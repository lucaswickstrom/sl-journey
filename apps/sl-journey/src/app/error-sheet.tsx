import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ErrorSheet() {
	const { message } = useLocalSearchParams<{ message: string }>();

	return (
		<View className="flex-1 justify-end bg-transparent">
			<View className="bg-gray-2 rounded-t-xl p-4">
				<Text className="text-gray-12 text-center text-lg mb-2">
					Something went wrong
				</Text>
				<Text className="text-gray-11 text-center mb-4">{message}</Text>
				<Pressable
					className="bg-gray-a4 border border-gray-a6 rounded-xl px-4 py-3"
					onPress={() => router.back()}
				>
					<Text className="text-gray-12 text-center">Dismiss</Text>
				</Pressable>
			</View>
		</View>
	);
}
