import { PressableScale } from "pressto";
import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";

export interface ListItemProps extends ViewProps {
	children: ReactNode;
	className?: string;
	onPress?: () => void;
}

export function ListItem({
	children,
	className = "",
	onPress,
	...props
}: ListItemProps) {
	const content = (
		<View
			className={`flex-row items-center justify-between px-4 py-3 ${className}`}
			{...props}
		>
			{children}
		</View>
	);

	if (onPress) {
		return <PressableScale onPress={onPress}>{content}</PressableScale>;
	}

	return content;
}
