import { ReactNode } from 'react'
import { AccessToken } from '../../internal/access-token'
import { Modals } from '../hooks'
import { Drawer } from './drawer'
import { Sidebar } from './sidebar'

interface LayoutProps {
	children: ReactNode
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className="flex flex-col h-screen text-slate-700 font-body selection:bg-rose-400 selection:text-slate-700">
			<div className="flex grow">
				<Sidebar />

				<div className="container flex mx-auto grow">
					{children}
					<Drawer kind={Modals.AccessToken} title="Personal Access Token" size="xl">
						<AccessToken />
					</Drawer>
				</div>
			</div>
		</div>
	)
}
