import { useHover } from "@mantine/hooks"
import clsx from "clsx"
import { BsGlobe } from "react-icons/bs"
import { AnimatePresence, motion } from "framer-motion"
import { ReactNode } from "react"
import { TbChevronLeft, TbExternalLink, TbFiles } from "react-icons/tb"
import { NavLink as RouterNavLink, useParams } from "react-router-dom"
import logo from "../../assets/images/logo.png"
import { useGetProjectTag } from "../hooks/use-project-query"
import useScreenSize from "../hooks/use-screen-size"

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
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"
	console.log(closed, "closedclosedclosed")
	return (
		<motion.aside
			ref={ref}
			className={clsx(
				"flex flex-col h-screen bg-rose-600 overflow-hidden",
				closable && "fixed z-50"
			)}
			animate={{ width: opened ? (smallScreen ? 250 : 300) : smallScreen ? 50 : 80 }}
			transition={{ type: "tween", duration: ANIMATION_DURATION }}
		>
			<div
				className={`${
					smallScreen && !opened ? "px-2 flex flex-col items-center " : "px-4 "
				} pt-16 grow`}
			>
				<img
					src={logo}
					className={`${smallScreen ? "w-10	 h-10	" : "w-12 h-12"} rounded-md`}
				/>
				<div className="mt-6">
					<BackToProjects closed={closed} />
				</div>
				<div className="mt-10">
					<NavLinks closed={closed} links={sidebar.navLinks} />
				</div>
				<UiBuilderLink closed={closed} />
			</div>
		</motion.aside>
	)
}

function UiBuilderLink({ closed }: { closed: boolean }) {
	const { projectName } = useParams()
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"
	return (
		<div className="px-5 pt-5 mt-10 -mx-5 border-t">
			<a
				target="_blank"
				rel="noreferrer"
				href={`https://ui.dotenx.com/ecommerce/${projectName}/index`}
				className={clsx(
					" text-white hover:bg-rose-500 w-full rounded-md flex items-center  font-medium gap-2 transition-all px-3 whitespace-nowrap",
					smallScreen ? "text-sm h-9" : "text-xl h-14 "
				)}
			>
				<div className={`shrink-0 transition-all text-lg  ${!closed && "hidden"} mt-1 `}>
					UI
				</div>
				<FadeIn visible={!closed}>
					<div className="flex items-center p-1">
						<TbExternalLink className="w-4 h-4 mr-4" />
						<span className={` shrink-0 ${smallScreen ? "text-sm " : "text-xl "}`}>
							UI builder
						</span>
					</div>
				</FadeIn>
			</a>
		</div>
	)
}

const useSidebar = () => {
	const { projectName } = useGetProjectTag()

	const sidebar: SidebarData = {
		navLinks: [
			{
				label: "Forms",
				icon: <TbFiles />,
				to: `/${projectName}/forms`,
			},
			{
				label: "Domains",
				icon: <BsGlobe />,
				to: `/${projectName}/domains`,
			},
		],
		subLinks: [],
	}

	return sidebar
}

function BackToProjects({ closed }: { closed: boolean }) {
	const { projectName = "" } = useParams()
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"

	return (
		<a
			href="https://admin.dotenx.com"
			className={`${
				smallScreen ? "h-8 " : "h-10 "
			} text-xl bg-white w-full rounded-md flex items-center font-medium gap-2 transition hover:bg-rose-100 px-3 whitespace-nowrap`}
		>
			<TbChevronLeft className={`shrink-0 ${smallScreen ? "text-sm " : "text-lg "} mt-1`} />
			<FadeIn visible={!closed}>
				<span className={`shrink-0 ${smallScreen ? "text-base " : "text-xl "}`}>
					{projectName}
				</span>
			</FadeIn>
		</a>
	)
}

function NavLinks({ links, closed }: { links: NavLinkData[]; closed: boolean }) {
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"

	return (
		<nav className={`${smallScreen ? "space-y-4" : "space-y-5"}`}>
			{links.map((link) => (
				<NavLink key={link.to} link={link} closed={closed} />
			))}
		</nav>
	)
}

function NavLink({ link, closed }: { link: NavLinkData; closed: boolean }) {
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"

	return (
		<RouterNavLink
			to={link.to}
			className={({ isActive }) =>
				clsx(
					"flex items-center gap-4 px-2 w-full  transition text-white rounded-md whitespace-nowrap ",
					isActive ? "bg-rose-700" : "hover:bg-rose-500 ",
					smallScreen ? "text-xl h-9  " : "text-xl h-14 "
				)
			}
		>
			<span className={`${closed ? " " : "pl-2 "} transition-all duration-300  `}>
				{link.icon}
			</span>
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
