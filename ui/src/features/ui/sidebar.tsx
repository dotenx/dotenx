import { memo, ReactNode } from 'react'
import {
	BsBricks,
	BsFillCalendar3WeekFill,
	BsFillDiagram3Fill,
	BsFillXDiamondFill,
	BsHddNetworkFill,
	BsTable,
	BsWindowSidebar,
} from 'react-icons/bs'
import { FaUsers } from 'react-icons/fa'
import { IoArrowBack, IoExit } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useMatch, useParams } from 'react-router-dom'
import { logout } from '../../api/admin'
import logo from '../../assets/images/logo.png'
import { ADMIN_URL, IS_LOCAL, PRIVATE_VERSION, PUBLIC_VERSION } from '../../constants'
import { NavItem } from './nav-item'

const studioLinks = [
	{ to: '/automations', label: 'Automation', icon: <BsFillDiagram3Fill /> },
	{ to: '/integrations', label: 'Integrations', icon: <BsHddNetworkFill /> },
	{ to: '/triggers', label: 'Triggers', icon: <BsFillCalendar3WeekFill /> },
]

export const Sidebar = memo(() => {
	const isBuilder = useMatch('/builder/*')
	const { projectName } = useParams()

	const builderLinks = [
		{
			to: `/builder/projects/${projectName}/user-management`,
			label: 'User management',
			icon: <FaUsers />,
		},
		{
			to: `/builder/projects/${projectName}/tables`,
			label: 'Tables',
			icon: <BsTable />,
		},
		{
			to: `/builder/projects/${projectName}/interactions`,
			label: 'Interactions',
			icon: <BsBricks />,
		},
		{
			to: `/builder/projects/${projectName}/templates`,
			label: 'Automation Templates',
			icon: <BsWindowSidebar />,
		},
		{
			to: `/builder/projects/${projectName}/providers`,
			label: 'Providers',
			icon: <BsFillXDiamondFill />,
		},
	]

	return (
		<div className="flex flex-col w-[86px] text-white transition-all py-7 bg-rose-600 group hover:w-64 overflow-hidden h-screen fixed z-10">
			<div className="flex items-center gap-6 px-[21px] text-xl font-medium">
				<img className="w-10 rounded" src={logo} alt="logo" />
				<div className="space-y-1 transition opacity-0 group-hover:opacity-100">
					<h1>DoTenX</h1>
					<h2 className="text-xs">{isBuilder ? 'Builder' : 'Studio'}</h2>
				</div>
			</div>
			{projectName && (
				<div className="px-5 mt-10 text-slate-700" title="Back to Projects">
					<a
						className="flex items-center gap-2 px-2.5 py-1 font-medium transition bg-white rounded hover:bg-rose-50"
						href="https://admin.dotenx.com/projects"
					>
						<div className="w-0 transition-all scale-0 opacity-0 group-hover:opacity-100 group-hover:w-6 group-hover:scale-100">
							<IoArrowBack />
						</div>
						<div>
							<span className="text-center capitalize">{projectName[0]}</span>
							<span className="transition opacity-0 group-hover:opacity-100">
								{projectName.substring(1)}
							</span>
						</div>
					</a>
				</div>
			)}
			<div className="flex flex-col justify-between grow">
				<SidebarLinks links={isBuilder ? builderLinks : studioLinks} />

				{!IS_LOCAL && <Logout />}
			</div>
			<div className="pt-4 text-[10px] text-center">
				<span title="Public Version">v{PUBLIC_VERSION}</span>
				{PRIVATE_VERSION && (
					<>
						<span> - </span>
						<span title="Internal Version">{PRIVATE_VERSION}</span>
					</>
				)}
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
		<div className="flex flex-col gap-6 mt-16">
			{links.map((item) => (
				<NavItem key={item.label} to={item.to}>
					<span className="text-xl">{item.icon}</span>
					<span className="text-sm font-medium transition opacity-0 whitespace-nowrap group-hover:opacity-100">
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
