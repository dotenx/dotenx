import { memo, ReactNode } from 'react'
import {
	BsBricks,
	BsFileEarmarkPdf,
	BsFillCalendar3WeekFill,
	BsFillDiagram3Fill,
	BsFillGrid1X2Fill,
	BsFillXDiamondFill,
	BsGlobe2,
	BsHddNetworkFill,
	BsTable,
	BsWindowSidebar,
} from 'react-icons/bs'
import { BiGitBranch } from 'react-icons/bi'
import { FaUsers } from 'react-icons/fa'
import { IoArrowBack, IoExit } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { useMatch, useParams } from 'react-router-dom'
import { logout } from '../../api/admin'
import logo from '../../assets/images/logo.png'
import {
	ADMIN_URL,
	IS_LOCAL,
	PRIVATE_VERSION,
	PUBLIC_VERSION,
	UI_BUILDER_ADDRESS,
} from '../../constants'
import { NavItem } from './nav-item'
import { Tour } from './tour'
import { Button } from '@mantine/core'
import { Modals, useModal } from '../hooks'
const studioLinks = [
	{ to: '/automations', label: 'Automation', icon: <BsFillDiagram3Fill /> },
	{ to: '/integrations', label: 'Integrations', icon: <BsHddNetworkFill /> },
	{ to: '/triggers', label: 'Triggers', icon: <BsFillCalendar3WeekFill /> },
]

export const Sidebar = memo(() => {
	const isBuilder = useMatch('/builder/*')
	const isHome = useMatch('/')
	const { projectName } = useParams()

	const builderLinks = [
		{
			to: `/builder/projects/${projectName}/user-management`,
			label: 'User management',
			tourSelector: 'user_management',
			icon: <FaUsers />,
		},
		{
			to: `/builder/projects/${projectName}/tables`,
			label: 'Tables',
			tourSelector: 'tables',
			icon: <BsTable />,
		},
		{
			to: `/builder/projects/${projectName}/interactions`,
			label: 'Interactions',
			tourSelector: 'interactions',
			icon: <BsBricks />,
		},
		{
			to: `/builder/projects/${projectName}/templates`,
			label: 'Automation Templates',
			tourSelector: 'automation_Templates',
			icon: <BsWindowSidebar />,
		},
		{
			to: `/builder/projects/${projectName}/providers`,
			label: 'Providers',
			tourSelector: 'providers',
			icon: <BsFillXDiamondFill />,
		},
		{
			to: `/builder/projects/${projectName}/files`,
			label: 'Files',
			tourSelector: 'files',
			icon: <BsFileEarmarkPdf />,
		},
		{
			to: `/builder/projects/${projectName}/domains`,
			label: 'Domains',
			tourSelector: 'domains',
			icon: <BsGlobe2 />,
		},
	]
	const modal = useModal()

	return (
		<div className="flex flex-col w-[86px] text-white transition-all py-7 bg-rose-600 group hover:w-64 overflow-hidden h-screen fixed z-10">
			<div className="flex items-center gap-6 px-[21px] text-xl font-medium">
				<img className="w-10 rounded " src={logo} alt="logo" />
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
						<div className="hidden w-0 transition-all scale-0 group-hover:inline group-hover:w-6 group-hover:scale-100">
							<IoArrowBack />
						</div>
						<div>
							<span className="text-center capitalize ">{projectName[0]}</span>
							<span className="hidden truncate transition group-hover:inline ">
								{projectName.substring(1)}
							</span>
						</div>
					</a>
				</div>
			)}
			<div className="flex  mt-6">
				<NavItem to={`/builder/projects/${projectName}/git`}>
					<span className="text-lg">
						<BiGitBranch />
					</span>
					<span className="text-sm font-medium transition  opacity-0 whitespace-nowrap group-hover:opacity-100 ">
						Git integration
					</span>
				</NavItem>
			</div>
			<div className="flex flex-col justify-between grow">
				<SidebarLinks links={isHome ? [] : isBuilder ? builderLinks : studioLinks} />

				{!isHome && (
					<>
						<Tour />
						<div className="space-y-2">
							<a
								href={`${UI_BUILDER_ADDRESS}/projects/${projectName}`}
								target="_blank"
								rel="noreferrer"
								className="flex items-center justify-between h-8 gap-6 py-6 pl-1 pr-8 transition ui_builder outline-rose-500 hover:bg-rose-500 focus:bg-rose-500"
							>
								<div className="w-1 h-8 transition rounded-sm shrink-0" />
								<div className="flex items-center gap-3 grow">
									<span className="text-xl">
										<BsFillGrid1X2Fill />
									</span>
									<span className="text-sm font-medium transition opacity-0 whitespace-nowrap group-hover:opacity-100">
										UI Builder
									</span>
								</div>
							</a>
						</div>
					</>
				)}
			</div>

			<div className="pt-4 text-[10px] text-center opacity-0 group-hover:opacity-100 transition-opacity">
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
		tourSelector?: string
	}[]
}

function SidebarLinks({ links }: SidebarLinksProps) {
	return (
		<div className="flex flex-col gap-2 mt-16">
			{links.map((item) => (
				<NavItem key={item.label} to={item.to} tourSelector={item.tourSelector}>
					<span className="text-xl">{item.icon}</span>
					<span className="text-sm font-medium transition opacity-0 whitespace-nowrap group-hover:opacity-100 ">
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
			className="flex items-center justify-between w-full h-8 gap-6 py-6 pl-1 pr-8 transition outline-rose-500 hover:bg-rose-500 focus:bg-rose-500"
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
