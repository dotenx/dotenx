import { useHover } from "@mantine/hooks"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"
import { BiDollarCircle } from "react-icons/bi"
import { BsChevronLeft, BsFiles, BsGlobe, BsPeopleFill } from "react-icons/bs"
import { FaBoxOpen, FaChartLine } from "react-icons/fa"
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
		</motion.aside>
	)
}

const useSidebar = () => {
	const { projectName } = useParams()

	const sidebar: SidebarData = {
		navLinks: [
			{
				label: "Products",
				icon: <FaBoxOpen />,
				to: `/projects/${projectName}/products`,
			},
			{
				label: "Sales",
				icon: <BiDollarCircle />,
				to: `/projects/${projectName}/sales`,
			},
			{
				label: "Analytics",
				icon: <FaChartLine />,
				to: `/projects/${projectName}/analytics`,
			},
			{
				label: "Audience",
				icon: <BsPeopleFill />,
				to: `/projects/${projectName}/audience`,
			},
			{
				label: "Files",
				icon: <BsFiles />,
				to: `/projects/${projectName}/files`,
			},
			{
				label: "Domains",
				icon: <BsGlobe />,
				to: `/projects/${projectName}/domains`,
			},
		],
		subLinks: [],
	}

	return sidebar
}

function BackToProjects({ closed }: { closed: boolean }) {
	const { projectName = "" } = useParams()

	return (
		<Link
			to="/"
			className="text-xl bg-white w-full rounded-md flex items-center h-10 font-medium gap-2 transition hover:bg-rose-100 px-3 whitespace-nowrap"
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
					"flex items-center gap-4 px-2 h-14 text-xl transition text-white rounded-md hover:bg-rose-700 whitespace-nowrap",
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
