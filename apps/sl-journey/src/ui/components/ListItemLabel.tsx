import { Text, type TextProps } from "./Text";

export interface ListItemLabelProps extends TextProps {}

export function ListItemLabel({
	className = "",
	...props
}: ListItemLabelProps) {
	return <Text className={className} {...props} />;
}
