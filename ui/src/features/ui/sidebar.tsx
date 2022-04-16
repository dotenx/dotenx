import { atom, useAtom } from 'jotai'
import {
	BsArrowLeft,
	BsArrowRight,
	BsFolderFill,
	BsHddNetworkFill,
	BsPipFill,
} from 'react-icons/bs'
import { useLocation } from 'react-router-dom'
import { IconButton } from './icon-button'
import { NavItem } from './nav-item'

const items = [
	{ to: '/', label: 'Automations', icon: <BsFolderFill /> },
	{ to: '/automations', label: 'Automations', icon: <BsFolderFill /> },
	{ to: '/integrations', label: 'Integrations', icon: <BsHddNetworkFill /> },
	{ to: '/triggers', label: 'Triggers', icon: <BsPipFill /> },
]

const isOpenAtom = atom(true)

export function Sidebar() {
	const { pathname } = useLocation()
	const [isOpen, setIsOpen] = useAtom(isOpenAtom)

	return (
		<div className="flex flex-col justify-between px-5 border-r border-gray-900 py-7">
			<div className="flex flex-col gap-4">
				{items.map((item) => (
					<NavItem key={item.label} to={item.to} selected={pathname === item.to}>
						{item.icon}
						{isOpen && item.label}
					</NavItem>
				))}
			</div>
			<div className="flex justify-center">
				<IconButton onClick={() => setIsOpen((isOpen) => !isOpen)}>
					{isOpen ? <BsArrowLeft /> : <BsArrowRight />}
				</IconButton>
			</div>
		</div>
	)
}
