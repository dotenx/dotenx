import { AppShell, Navbar } from "@mantine/core"
import { ReactNode } from "react"
import { Sidebar } from "../app/sidebar"
import useScreenSize from "../hooks/use-screen-size"

interface LayoutProps {
	children: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}

export function Layout({ children, compactSidebar = false, withoutSidebar }: LayoutProps) {
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"

	return (
		<div className="text-slate-900 font-body selection:bg-rose-400 selection:text-slate-900">
			<AppShell
				padding={0}
				navbar={
					withoutSidebar ? undefined : (
						<Navbar
							width={{
								base: !compactSidebar
									? smallScreen
										? 250
										: 300
									: smallScreen
									? 50
									: 80,
							}}
						>
							<Sidebar closable={compactSidebar} />
						</Navbar>
					)
				}
				className="bg-gray-100"
			>
				{children}
			</AppShell>
		</div>
	)
}
