import { ReactNode } from 'react'
import { Sidebar } from './sidebar'

interface LayoutProps {
	children: ReactNode
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className="flex flex-col h-screen font-body text-neutral-700">
			<div className="flex grow">
				<Sidebar />
				<div className="flex grow">{children}</div>
			</div>
		</div>
	)
}
