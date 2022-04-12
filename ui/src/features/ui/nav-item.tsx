/** @jsxImportSource @emotion/react */
import { ReactNode } from 'react'
import { BsArrowRightShort } from 'react-icons/bs'
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
				padding: '4px 20px',
				borderRadius: 4,
				textDecoration: 'none',
				display: 'flex',
				alignItems: 'center',
				gap: 6,
				justifyContent: 'space-between',
				':hover': {
					backgroundColor: theme.color.text,
					color: theme.color.background,
				},
			})}
		>
			{children}
			<BsArrowRightShort />
		</Link>
	)
}
