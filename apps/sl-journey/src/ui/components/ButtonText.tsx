import { Text, type TextProps } from "./Text";

export interface ButtonTextProps extends TextProps {}

export function ButtonText({ className = "", ...props }: ButtonTextProps) {
	return <Text className={`text-center ${className}`} {...props} />;
}
