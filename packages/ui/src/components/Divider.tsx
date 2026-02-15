import { StyleSheet, View, type ViewProps } from "react-native";

export interface DividerProps extends ViewProps {
	className?: string;
}

export function Divider({ className = "", style, ...props }: DividerProps) {
	return (
		<View
			className={`bg-gray-a6 ${className}`}
			style={[styles.divider, style]}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	divider: {
		height: StyleSheet.hairlineWidth,
	},
});
