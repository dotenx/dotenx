import { useViewportSize } from "@mantine/hooks"
import { ReactNode } from "react"
import { Route, Routes as ReactRoutes } from "react-router-dom"
import { FormsPage } from "../../pages/forms"
import { DomainsPage } from "../../pages/domains"
import { HomePage } from "../../pages/home"
import { NotFoundPage } from "../../pages/not-found"
import { Layout } from "../ui/layout"
import useScreenSize from "../hooks/use-screen-size"

type Routes = {
	path: string
	element: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}[]

const routes: Routes = [
	{
		path: "/:projectName/forms/:page",
		element: <FormsPage />,
	},

	{
		path: "/:projectName/domains",
		element: <DomainsPage />,
	},
	{
		path: "/:projectName/forms",
		element: <HomePage />,
	},
	{
		path: "/*",
		element: <NotFoundPage />,
		withoutSidebar: true,
	},
]

export function Routes() {
	const { width } = useViewportSize()
	const screenSize = useScreenSize()
	const smallScreen = screenSize !== "desktop"

	if (width === 0) return null
	return (
		<ReactRoutes>
			{routes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<Layout
							withoutSidebar={route.withoutSidebar}
							compactSidebar={smallScreen || route.compactSidebar}
						>
							{route.element}
						</Layout>
					}
				/>
			))}
		</ReactRoutes>
	)
}
