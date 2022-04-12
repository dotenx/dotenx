/** @jsxImportSource @emotion/react */
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface NavItemProps {
	children: ReactNode
	to: string
	selected: boolean
}

export function NavItem({ to, children, selected }: NavItemProps) {
	return (
		<Link
			to={to}
			css={(theme) => ({
				color: selected ? theme.color.background : theme.color.text,
				backgroundColor: selected ? theme.color.text : theme.color.background,
				borderRadius: 4,
				textDecoration: 'none',
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				':hover': {
					backgroundColor: theme.color.text,
					color: theme.color.background,
				},
			})}
			className="h-8 px-4"
		>
			{children}
		</Link>
	)
}
