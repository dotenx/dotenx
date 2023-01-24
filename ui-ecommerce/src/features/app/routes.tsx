import { useViewportSize } from "@mantine/hooks"
import { ReactNode } from "react"
import { Route, Routes as ReactRoutes } from "react-router-dom"
import DomainsPage from "../../pages/domains"
import Files from "../../pages/files"
import GitIntegrationPage from "../../pages/git/git"
import GitRedirectPage from "../../pages/git/git-redirect"
import { HomePage } from "../../pages/home"
import NotFoundPage from "../../pages/not-found"
import TablePage from "../../pages/table"
import TablesPage from "../../pages/tables"
import UserGroupsPage from "../../pages/user-groups"
import UserManagementPage from "../../pages/user-management"
import { ViewPage } from "../../pages/view"
import { Layout } from "../ui"

type Routes = {
	path: string
	element: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}[]

const routes: Routes = [
	{
		path: "/builder/projects/:projectName/views/:viewName",
		element: <ViewPage />,
	},
	{
		path: "/builder/projects/:projectName/tables/:tableName/:isPublic",
		element: <TablePage />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/tables",
		element: <TablesPage />,
	},
	{
		path: "/builder/projects/:projectName/git",
		element: <GitIntegrationPage />,
	},
	{
		path: "/builder/git/integration/callback",
		element: <GitRedirectPage />,
	},
	{
		path: "/builder/projects/:projectName/user-management/user-groups",
		element: <UserGroupsPage />,
	},
	{
		path: "/builder/projects/:projectName/user-management",
		element: <UserManagementPage />,
	},
	{
		path: "/builder/projects/:projectName/files",
		element: <Files />,
	},
	{
		path: "/builder/projects/:projectName/domains",
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

	if (width < 600) {
		return (
			<div className="w-full px-20 pt-10 text-center ">
				Dotenx is not designed for mobile use, please come back with a bigger screen.
			</div>
		)
	} else
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
