import { useViewportSize } from "@mantine/hooks"
import { ReactNode } from "react"
import { Route, Routes as ReactRoutes } from "react-router-dom"
import { AnalyticsPage } from "../../pages/analytics"
import { AudiencePage } from "../../pages/audience"
import { CreateSchedulePage } from "../../pages/create-schedule"
import { DomainsPage } from "../../pages/domains"
import { EditProductPage } from "../../pages/edit-product"
import { Files } from "../../pages/files"
import { HomePage } from "../../pages/home"
import { NewProductPage } from "../../pages/new-product"
import { NotFoundPage } from "../../pages/not-found"
import { ProductsPage } from "../../pages/products"
import { SalesPage } from "../../pages/sales"
import { UpdateSchedulePage } from "../../pages/update-schedule"
import { Layout } from "../ui"

type Routes = {
	path: string
	element: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}[]

const routes: Routes = [
	{
		path: "/projects/:projectName/products/New",
		element: <NewProductPage />,
	},
	{
		path: "/projects/:projectName/products/:id",
		element: <EditProductPage />,
	},
	{
		path: "/projects/:projectName/products",
		element: <ProductsPage />,
	},
	{
		path: "/projects/:projectName/sales",
		element: <SalesPage />,
	},
	{
		path: "/projects/:projectName/analytics",
		element: <AnalyticsPage />,
	},
	{
		path: "/projects/:projectName/audience",
		element: <AudiencePage />,
	},
	{
		path: "/projects/:projectName/audience/new",
		element: <CreateSchedulePage />,
	},
	{
		path: "/projects/:projectName/audience/:name",
		element: <UpdateSchedulePage />,
	},
	{
		path: "/projects/:projectName/files",
		element: <Files />,
	},
	{
		path: "/projects/:projectName/domains",
		element: <DomainsPage />,
	},
	{
		path: "/",
		element: <HomePage />,
		withoutSidebar: true,
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
