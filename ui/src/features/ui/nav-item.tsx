import clsx from 'clsx'
import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavItemProps {
	children: ReactNode
	to: string
	tourSelector?: string
}

export function NavItem({ to, children, tourSelector }: NavItemProps) {
	const { pathname } = useLocation()
	const selected = pathname.startsWith(to)
	return (
		<Link
			to={to}
			className={clsx(
				'flex items-center w-full justify-between h-8 gap-6 py-6 pl-1 pr-8 transition outline-rose-500 hover:bg-rose-500 focus:bg-rose-500 ',
				tourSelector
			)}
		>
			<div
				className={clsx('w-1 h-8 rounded-sm shrink-0 transition', selected && 'bg-white')}
			/>
			<div className="flex items-center gap-3 grow">{children}</div>
		</Link>
	)
}
