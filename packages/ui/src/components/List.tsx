import type { ReactNode } from "react";
import { Children, Fragment, cloneElement, isValidElement } from "react";
import { Card, type CardProps } from "./Card";
import { Divider } from "./Divider";

export interface ListProps extends CardProps {
	children: ReactNode;
}

export function List({ children, className = "", ...props }: ListProps) {
	const childArray = Children.toArray(children).filter(isValidElement);

	return (
		<Card className={`overflow-hidden ${className}`} {...props}>
			{childArray.map((child, index) => (
				<Fragment key={child.key ?? index}>
					{index > 0 && <Divider className="ml-4" />}
					{cloneElement(child)}
				</Fragment>
			))}
		</Card>
	);
}
