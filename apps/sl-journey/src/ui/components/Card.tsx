import { View, type ViewProps } from "react-native";

export interface CardProps extends ViewProps {
	className?: string;
}

export function Card({ className = "", ...props }: CardProps) {
	return (
		<View
			className={`bg-gray-a4 border-hairline border-gray-a6 rounded-xl ${className}`}
			{...props}
		/>
	);
}
