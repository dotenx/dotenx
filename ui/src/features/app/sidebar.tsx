import { ReactNode } from "react"
import {
	BsBoxSeam,
	BsChevronLeft,
	BsFiles,
	BsFillDiagram2Fill,
	BsFillDiagram3Fill,
	BsFillExclamationCircleFill,
	BsGlobe,
	BsHddNetworkFill,
	BsPeopleFill,
	BsTable,
} from "react-icons/bs"
import { Link } from "react-router-dom"
import logo from "../../assets/images/logo.png"

type SidebarData = {
	projectName: string
	projectsPage: string
	navLinks: NavLinkData[]
	subLinks: SubLinkData[]
}

type NavLinkData = {
	label: string
	icon: ReactNode
	to: string
}

type SubLinkData = {
	icon: ReactNode
	to: string
}

const sidebarData: SidebarData = {
	projectName: "Project name",
	projectsPage: "/",
	navLinks: [
		{ label: "Workflows", icon: <BsFillDiagram3Fill />, to: "/" },
		{ label: "Tables", icon: <BsTable />, to: "/" },
		{ label: "User management", icon: <BsPeopleFill />, to: "/" },
		{ label: "Providers", icon: <BsHddNetworkFill />, to: "/" },
		{ label: "Files", icon: <BsFiles />, to: "/" },
		{ label: "Domains", icon: <BsGlobe />, to: "/" },
	],
	subLinks: [
		{ icon: <BsBoxSeam />, to: "/" },
		{ icon: <BsFillDiagram2Fill />, to: "/" },
		{ icon: <BsFillExclamationCircleFill />, to: "/" },
	],
}

export function Sidebar() {
	return (
		<aside className="flex flex-col h-screen bg-rose-600 w-80">
			<div className="px-4 pt-16 grow">
				<img src={logo} className="w-12 h-12 rounded-md" />
				<div className="mt-6">
					<BackToProjects />
				</div>
				<div className="mt-10">
					<NavLinks />
				</div>
			</div>
			<div className="flex flex-col items-center py-6 border-t border-white">
				<SubLinks />
			</div>
		</aside>
	)
}

function BackToProjects() {
	return (
		<Link
			to={sidebarData.projectsPage}
			className="text-lg bg-white w-full rounded-md flex items-center py-0.5 font-medium gap-2 hover:bg-rose-100 px-4"
		>
			<BsChevronLeft className="text-xl" />
			<span>{sidebarData.projectName}</span>
		</Link>
	)
}

function NavLinks() {
	return (
		<nav className="space-y-6">
			{sidebarData.navLinks.map((link) => (
				<NavLink key={link.to} link={link} />
			))}
		</nav>
	)
}

function NavLink({ link }: { link: NavLinkData }) {
	return (
		<Link
			to={link.to}
			className="flex items-center gap-4 px-2 py-3 text-lg text-white rounded-md hover:bg-rose-700"
		>
			<span>{link.icon}</span>
			<span>{link.label}</span>
		</Link>
	)
}

function SubLinks() {
	return (
		<nav className="flex gap-2">
			{sidebarData.subLinks.map((link) => (
				<SubLink key={link.to} link={link} />
			))}
		</nav>
	)
}

function SubLink({ link }: { link: SubLinkData }) {
	return (
		<Link to={link.to} className="text-lg text-white hover:text-rose-100">
			{link.icon}
		</Link>
	)
}
