import { AppShell, Navbar } from "@mantine/core"
import { ReactNode } from "react"
import { Sidebar } from "../app/sidebar"

interface LayoutProps {
	children: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}

export function Layout({ children, compactSidebar = false, withoutSidebar }: LayoutProps) {
	return (
		<div className="text-slate-700 font-body selection:bg-rose-400 selection:text-slate-700">
			<AppShell
				padding="xl"
				navbar={
					withoutSidebar ? undefined : (
						<Navbar width={{ base: compactSidebar ? 80 : 300 }}>
							<Sidebar closable={compactSidebar} />
						</Navbar>
					)
				}
			>
				{children}
			</AppShell>
		</div>
	)
}
