import clsx from 'clsx'
import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItemProps {
	children: ReactNode
	to: string
}

export function NavItem({ to, children }: NavItemProps) {
	const { pathname } = useLocation()
	const selected = pathname.startsWith(to)

	return (
		<Link
			to={to}
			className="flex items-center justify-between h-8 gap-6 py-6 pl-1 pr-8 transition hover:bg-rose-500"
		>
			<div
				className={clsx('w-1 h-8 rounded-sm shrink-0 transition', selected && 'bg-white')}
			/>
			<div className="flex items-center gap-4 grow">{children}</div>
		</Link>
	)
}
