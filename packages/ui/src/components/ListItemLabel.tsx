import { Text, type TextProps } from "react-native";

export interface ListItemLabelProps extends TextProps {
	className?: string;
}

export function ListItemLabel({
	className = "",
	...props
}: ListItemLabelProps) {
	return <Text className={`text-gray-12 ${className}`} {...props} />;
}
