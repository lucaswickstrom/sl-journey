import { StyleSheet, View, type ViewProps } from "react-native";

export interface CardProps extends ViewProps {
	className?: string;
}

export function Card({ className = "", style, ...props }: CardProps) {
	return (
		<View
			className={`bg-gray-a4 rounded-xl ${className}`}
			style={[styles.card, style]}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	card: {
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "rgba(255,255,255,0.172)", // gray-a6
	},
});
