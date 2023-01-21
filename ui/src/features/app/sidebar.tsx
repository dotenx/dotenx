import { useHover } from "@mantine/hooks"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"
import {
	BsChevronLeft,
	BsFiles,
	BsFillDiagram2Fill,
	BsFillDiagram3Fill,
	BsGlobe,
	BsHddNetworkFill,
	BsPeopleFill,
	BsTable,
} from "react-icons/bs"
import { Link, NavLink as RouterNavLink, useParams } from "react-router-dom"
import logo from "../../assets/images/logo.png"

const ANIMATION_DURATION = 0.15

type SidebarData = {
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

export function Sidebar({ closable }: { closable: boolean }) {
	const sidebar = useSidebar()
	const { ref, hovered } = useHover()
	const closed = closable && !hovered
	const opened = !closable || (closable && hovered)

	return (
		<motion.aside
			ref={ref}
			className={clsx(
				"flex flex-col h-screen bg-rose-600 overflow-hidden",
				closable && "fixed z-50"
			)}
			animate={{ width: opened ? 300 : 80 }}
			transition={{ type: "tween", duration: ANIMATION_DURATION }}
		>
			<div className="px-4 pt-16 grow">
				<img src={logo} className="w-12 h-12 rounded-md" />
				<div className="mt-6">
					<BackToProjects closed={closed} />
				</div>
				<div className="mt-10">
					<NavLinks closed={closed} links={sidebar.navLinks} />
				</div>
			</div>
			<div className="flex flex-col items-center justify-center h-16 border-t border-white">
				<FadeIn visible={!closed}>
					<SubLinks links={sidebar.subLinks} />
				</FadeIn>
			</div>
		</motion.aside>
	)
}

const useSidebar = () => {
	const { projectName } = useParams()

	const sidebar: SidebarData = {
		navLinks: [
			{
				label: "Tables",
				icon: <BsTable />,
				to: `/builder/projects/${projectName}/tables`,
			},
			{
				label: "User management",
				icon: <BsPeopleFill />,
				to: `/builder/projects/${projectName}/user-management`,
			},
			{
				label: "Workflows",
				icon: <BsFillDiagram3Fill />,
				to: `/builder/projects/${projectName}/workflows`,
			},
			{
				label: "Providers",
				icon: <BsHddNetworkFill />,
				to: `/builder/projects/${projectName}/providers`,
			},
			{
				label: "Files",
				icon: <BsFiles />,
				to: `/builder/projects/${projectName}/files`,
			},
			{
				label: "Domains",
				icon: <BsGlobe />,
				to: `/builder/projects/${projectName}/domains`,
			},
		],
		subLinks: [
			{
				icon: <BsFillDiagram2Fill />,
				to: `/builder/projects/${projectName}/git`,
			},
		],
	}

	return sidebar
}

function BackToProjects({ closed }: { closed: boolean }) {
	const { projectName = "" } = useParams()

	return (
		<Link
			to="/"
			className="text-xl bg-white w-full rounded-md flex items-center h-8 font-medium gap-2 transition hover:bg-rose-100 px-3 whitespace-nowrap"
		>
			<BsChevronLeft className="text-xl shrink-0" />
			<FadeIn visible={!closed}>{projectName}</FadeIn>
		</Link>
	)
}

function NavLinks({ links, closed }: { links: NavLinkData[]; closed: boolean }) {
	return (
		<nav className="space-y-6">
			{links.map((link) => (
				<NavLink key={link.to} link={link} closed={closed} />
			))}
		</nav>
	)
}

function NavLink({ link, closed }: { link: NavLinkData; closed: boolean }) {
	return (
		<RouterNavLink
			to={link.to}
			className={({ isActive }) =>
				clsx(
					"flex items-center gap-4 px-2 h-12 text-xl transition text-white rounded-md hover:bg-rose-700 whitespace-nowrap",
					isActive && "bg-rose-700"
				)
			}
		>
			<span className="pl-2">{link.icon}</span>
			<FadeIn visible={!closed}>
				<span>{link.label}</span>
			</FadeIn>
		</RouterNavLink>
	)
}

function SubLinks({ links }: { links: SubLinkData[] }) {
	return (
		<nav className="flex gap-2">
			{links.map((link) => (
				<SubLink key={link.to} link={link} />
			))}
		</nav>
	)
}

function SubLink({ link }: { link: SubLinkData }) {
	return (
		<Link to={link.to} className="text-lg text-white transition hover:text-rose-100">
			{link.icon}
		</Link>
	)
}

function FadeIn({ children, visible }: { children: ReactNode; visible: boolean }) {
	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ opacity: 0, transform: "translateX(20px)" }}
					animate={{ opacity: 1, transform: "translateX(0px)" }}
					exit={{ opacity: 0, transform: "translateX(20px)" }}
					transition={{ type: "tween", duration: ANIMATION_DURATION }}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	)
}
