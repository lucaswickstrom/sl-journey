import { View, type ViewProps } from "react-native";

export interface HStackProps extends ViewProps {
	className?: string;
}

export function HStack({ className = "", ...props }: HStackProps) {
	return <View className={`flex-row ${className}`} {...props} />;
}
