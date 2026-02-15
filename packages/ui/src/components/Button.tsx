import { PressableScale } from "pressto";
import type { ReactNode } from "react";
import { Children, isValidElement } from "react";
import { Pressable } from "react-native";
import { withUniwind } from "uniwind";
import { ButtonText } from "./ButtonText";

const StyledPressableScale = withUniwind(PressableScale);

export interface ButtonProps {
	children: ReactNode;
	onPress?: () => void;
	className?: string;
	disabled?: boolean;
}

const baseClassName =
	"bg-gray-a4 border-hairline border-gray-a6 rounded-xl px-4 py-3" as const;

export function Button({
	children,
	onPress,
	className = "",
	disabled,
}: ButtonProps) {
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
			<Pressable className={`${baseClassName} opacity-50 ${className}`}>
				{content}
			</Pressable>
		);
	}

	return (
		<StyledPressableScale
			onPress={onPress}
			className={`${baseClassName} ${className}`}
		>
			{content}
		</StyledPressableScale>
	);
}
