import clsx from 'clsx'
import { ReactNode } from 'react'

interface ContentWrapperProps {
	children: ReactNode
	className?: string
}

export function ContentWrapper({ children, className }: ContentWrapperProps) {
	return (
		<main
			className={clsx(
				'lg:pr-32 pl-24 py-6 lg:pl-52 lg:py-16 space-y-10 grow px-4',
				className
			)}
		>
			{children}
		</main>
	)
}
