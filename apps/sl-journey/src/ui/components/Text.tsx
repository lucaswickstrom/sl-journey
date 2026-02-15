import { Text as RNText, type TextProps as RNTextProps } from "react-native";

export interface TextProps extends RNTextProps {
	className?: string;
}

export function Text({ className = "", ...props }: TextProps) {
	return <RNText className={`text-gray-12 ${className}`} {...props} />;
}
