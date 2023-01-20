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
				padding={0}
				navbar={
					withoutSidebar ? undefined : (
						<Navbar width={{ base: compactSidebar ? 80 : 300 }}>
							<Sidebar closable={compactSidebar} />
						</Navbar>
					)
				}
				className="bg-[#ECECEC]"
			>
				{children}
			</AppShell>
		</div>
	)
}
