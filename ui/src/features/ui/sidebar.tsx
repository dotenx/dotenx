import { memo } from 'react'
import { BsFillCalendar3WeekFill, BsFillDiagram3Fill, BsHddNetworkFill } from 'react-icons/bs'
import logo from '../../assets/images/logo.png'
import { NavItem } from './nav-item'

const items = [
	{ to: '/automations', label: 'Automations', icon: <BsFillDiagram3Fill /> },
	{ to: '/integrations', label: 'Integrations', icon: <BsHddNetworkFill /> },
	{ to: '/triggers', label: 'Triggers', icon: <BsFillCalendar3WeekFill /> },
]

export const Sidebar = memo(() => {
	return (
		<div className="flex flex-col w-[86px] text-white transition-all py-7 bg-rose-600 group hover:w-56">
			<div className="flex items-center gap-4 px-5 text-xl font-medium">
				<img className="w-10 rounded" src={logo} alt="logo" />
				<span className="transition opacity-0 group-hover:opacity-100">DoTenX</span>
			</div>
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
		</div>
	)
})

Sidebar.displayName = 'Sidebar'
