import { useViewportSize } from "@mantine/hooks"
import { ReactNode } from "react"
import { Route, Routes as ReactRoutes } from "react-router-dom"
import { FormsPage } from "../../pages/forms"
import { DomainsPage } from "../../pages/domains"
import { HomePage } from "../../pages/home"
import { NotFoundPage } from "../../pages/not-found"
import { Layout } from "../ui/layout"

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

	if (width === 0) return null

	if (width < 600)
		return (
			<div className="w-full px-20 pt-10 text-center ">
				Dotenx is not designed for mobile use, please come back with a bigger screen.
			</div>
		)

	return (
		<ReactRoutes>
			{routes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={
						<Layout
							withoutSidebar={route.withoutSidebar}
							compactSidebar={route.compactSidebar}
						>
							{route.element}
						</Layout>
					}
				/>
			))}
		</ReactRoutes>
	)
}
