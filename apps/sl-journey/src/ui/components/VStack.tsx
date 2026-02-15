import { View, type ViewProps } from "react-native";

export interface VStackProps extends ViewProps {
	className?: string;
}

export function VStack({ className = "", ...props }: VStackProps) {
	return <View className={`flex-col ${className}`} {...props} />;
}
