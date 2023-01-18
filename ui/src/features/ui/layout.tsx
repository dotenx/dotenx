import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
// import { Sidebar } from "../app/sidebar"

interface LayoutProps {
	children: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}

export function Layout({ children, compactSidebar = false, withoutSidebar }: LayoutProps) {
	return (
		<div className="flex flex-col h-screen text-slate-700 font-body selection:bg-rose-400 selection:text-slate-700">
			<div className="flex grow">
				<Sidebar />
				{/* <div>{!withoutSidebar && <Sidebar closable={compactSidebar} />}</div> */}
				<div className="container flex mx-auto grow">{children}</div>
			</div>
		</div>
	)
}
