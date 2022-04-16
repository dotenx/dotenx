import { ReactNode } from 'react'
import logo from '../../assets/images/logo.png'
import { Sidebar } from './sidebar'

interface LayoutProps {
	children: ReactNode
	header?: ReactNode
}

export function Layout({ children, header = null }: LayoutProps) {
	return (
		<div className="flex flex-col h-screen font-body text-neutral-700">
			<div className="flex border-b border-black">
				<div className="flex items-center px-5 py-4 font-thin border-r border-black">
					<img className="h-[5vh] w-auto" src={logo} alt="logo" />
				</div>
				<div className="grow">{header}</div>
			</div>
			<div className="flex grow">
				<Sidebar />
				<div className="flex grow">{children}</div>
			</div>
		</div>
	)
}
