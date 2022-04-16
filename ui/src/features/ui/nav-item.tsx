import clsx from 'clsx'
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
			className={clsx(
				'flex items-center h-8 gap-4 px-4 rounded',
				selected ? 'bg-black text-white' : 'hover:bg-gray-50'
			)}
		>
			{children}
		</Link>
	)
}
