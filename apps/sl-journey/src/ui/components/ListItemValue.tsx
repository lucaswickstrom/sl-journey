import { Text, type TextProps } from "./Text";

export interface ListItemValueProps extends TextProps {}

export function ListItemValue({
	className = "",
	...props
}: ListItemValueProps) {
	return <Text className={`text-gray-11 ${className}`} {...props} />;
}
