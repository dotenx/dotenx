import { AppShell, Navbar } from "@mantine/core"
import { ReactNode } from "react"
import { Sidebar } from "../app/sidebar"

interface LayoutProps {
	children: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}

export function Layout({ children, compactSidebar = false, withoutSidebar }: LayoutProps) {
	const smallScreen = window.innerHeight < 750

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
									? 70
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
