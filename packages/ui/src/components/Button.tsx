import { PressableScale } from "pressto";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import {
	Pressable,
	type StyleProp,
	StyleSheet,
	type ViewStyle,
} from "react-native";
import { ButtonText } from "./ButtonText";

export interface ButtonProps {
	children: ReactNode;
	onPress?: () => void;
	style?: StyleProp<ViewStyle>;
	disabled?: boolean;
}

export function Button({ children, onPress, style, disabled }: ButtonProps) {
	// Auto-wrap string children in ButtonText
	const content = Children.map(children, (child) => {
		if (typeof child === "string") {
			return <ButtonText>{child}</ButtonText>;
		}
		if (isValidElement(child)) {
			return child;
		}
		return null;
	});

	if (disabled) {
		return (
			<Pressable style={[styles.button, style, styles.disabled]}>
				{content}
			</Pressable>
		);
	}

	return (
		<PressableScale onPress={onPress} style={[styles.button, style]}>
			{content}
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: "rgba(255,255,255,0.105)", // gray-a4
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: "rgba(255,255,255,0.172)", // gray-a6
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	disabled: {
		opacity: 0.5,
	},
});
