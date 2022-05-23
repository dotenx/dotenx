import { memo } from 'react'
import { BsFillCalendar3WeekFill, BsFillDiagram3Fill, BsHddNetworkFill } from 'react-icons/bs'
import { IoExit } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { logout } from '../../api/admin'
import logo from '../../assets/images/logo.png'
import { IS_LOCAL } from '../../constants'
import { NavItem } from './nav-item'

const items = [
	{ to: '/automations', label: 'Automations', icon: <BsFillDiagram3Fill /> },
	{ to: '/integrations', label: 'Integrations', icon: <BsHddNetworkFill /> },
	{ to: '/triggers', label: 'Triggers', icon: <BsFillCalendar3WeekFill /> },
]

export const Sidebar = memo(() => {
	return (
		<div className="flex flex-col w-[86px] text-white transition-all py-7 bg-rose-600 group hover:w-56 overflow-hidden">
			<div className="flex items-center gap-4 px-5 text-xl font-medium">
				<img className="w-10 rounded" src={logo} alt="logo" />
				<span className="transition opacity-0 group-hover:opacity-100">DoTenX</span>
			</div>
			<div className="flex flex-col justify-between grow">
				<div className="flex flex-col gap-6 mt-20">
					{items.map((item) => (
						<NavItem key={item.label} to={item.to}>
							<span className="text-xl">{item.icon}</span>
							<span className="transition opacity-0 group-hover:opacity-100">
								{item.label}
							</span>
						</NavItem>
					))}
				</div>

				{!IS_LOCAL && <Logout />}
			</div>
		</div>
	)
})

function Logout() {
	const logoutMutation = useMutation(logout, {
		onSuccess: () => window.location.replace('https://admin.dotenx.com'),
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
