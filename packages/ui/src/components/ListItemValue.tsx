import { Text, type TextProps } from "react-native";

export interface ListItemValueProps extends TextProps {
	className?: string;
}

export function ListItemValue({
	className = "",
	...props
}: ListItemValueProps) {
	return <Text className={`text-gray-11 ${className}`} {...props} />;
}
