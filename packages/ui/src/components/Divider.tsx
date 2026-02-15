import { View, type ViewProps } from "react-native";

export interface DividerProps extends ViewProps {
	className?: string;
}

export function Divider({ className = "", ...props }: DividerProps) {
	return (
		<View className={`bg-gray-a6 h-hairline ${className}`} {...props} />
	);
}
