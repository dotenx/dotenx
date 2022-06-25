import { memo, ReactNode } from 'react'
import {
	BsFillCalendar3WeekFill,
	BsFillDiagram3Fill,
	BsFillXDiamondFill,
	BsHddNetworkFill,
	BsHeptagonFill,
} from 'react-icons/bs'
import { IoExit } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useMatch } from 'react-router-dom'
import { logout } from '../../api/admin'
import logo from '../../assets/images/logo.png'
import { ADMIN_URL, IS_LOCAL } from '../../constants'
import { NavItem } from './nav-item'

const studioLinks = [
	{ to: '/automations', label: 'Automations', icon: <BsFillDiagram3Fill /> },
	{ to: '/integrations', label: 'Integrations', icon: <BsHddNetworkFill /> },
	{ to: '/triggers', label: 'Triggers', icon: <BsFillCalendar3WeekFill /> },
]

const builderLinks = [
	{ to: '/builder/projects', label: 'Projects', icon: <BsHeptagonFill /> },
	{ to: '/builder/providers', label: 'Providers', icon: <BsFillXDiamondFill /> },
]

export const Sidebar = memo(() => {
	const isBuilder = useMatch('/builder/*')

	return (
		<div className="flex flex-col w-[86px] text-white transition-all py-7 bg-rose-600 group hover:w-56 overflow-hidden">
			<div className="flex items-center gap-6 px-5 text-xl font-medium">
				<img className="w-10 rounded" src={logo} alt="logo" />
				<div className="space-y-1 transition opacity-0 group-hover:opacity-100">
					<h1>DoTenX</h1>
					<h2 className="text-xs">{isBuilder ? 'Builder' : 'Studio'}</h2>
				</div>
			</div>
			<div className="flex flex-col justify-between grow">
				<SidebarLinks links={isBuilder ? builderLinks : studioLinks} />

				{!IS_LOCAL && <Logout />}
			</div>
		</div>
	)
})

type SidebarLinksProps = {
	links: {
		to: string
		label: string
		icon: ReactNode
	}[]
}

function SidebarLinks({ links }: SidebarLinksProps) {
	return (
		<div className="flex flex-col gap-6 mt-20">
			{links.map((item) => (
				<NavItem key={item.label} to={item.to}>
					<span className="text-xl">{item.icon}</span>
					<span className="transition opacity-0 group-hover:opacity-100">
						{item.label}
					</span>
				</NavItem>
			))}
		</div>
	)
}

function Logout() {
	const logoutMutation = useMutation(logout, {
		onSuccess: () => window.location.replace(ADMIN_URL),
	})

	return (
		<button
			className="flex items-center justify-between h-8 gap-6 py-6 pl-1 pr-8 transition outline-rose-500 hover:bg-rose-500 focus:bg-rose-500"
			onClick={() => logoutMutation.mutate()}
		>
			<div className="w-1 h-8 transition rounded-sm shrink-0" />
			<div className="flex items-center gap-4 grow">
				<span className="text-xl">
					<IoExit />
				</span>
				<span className="transition opacity-0 group-hover:opacity-100">Logout</span>
			</div>
		</button>
	)
}

Sidebar.displayName = 'Sidebar'
