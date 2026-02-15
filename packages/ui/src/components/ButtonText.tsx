import { Text, type TextProps } from "react-native";

export interface ButtonTextProps extends TextProps {
	className?: string;
}

export function ButtonText({ className = "", ...props }: ButtonTextProps) {
	return (
		<Text className={`text-gray-12 text-center ${className}`} {...props} />
	);
}
