import { useViewportSize } from "@mantine/hooks"
import Cookies from "js-cookie"
import { ReactNode, useEffect } from "react"
import { Route, Routes as ReactRoutes, useLocation } from "react-router-dom"
import { ADMIN_URL, IS_LOCAL } from "../../constants"
import AutomationPage from "../../pages/automation"
import AutomationsPage from "../../pages/automations"
import DomainsPage from "../../pages/domains"
import ExecutionPage from "../../pages/execution"
import Files from "../../pages/files"
import GitIntegrationPage from "../../pages/git/git"
import GitRedirectPage from "../../pages/git/git-redirect"
import HistoryPage from "../../pages/history"
import { HomePage } from "../../pages/home"
import ImportYamlPage from "../../pages/import-yaml"
import IntegrationsPage from "../../pages/integrations"
import InteractionPage from "../../pages/interaction"
import InteractionsPage from "../../pages/interactions"
import NotFoundPage from "../../pages/not-found"
import OauthPage from "../../pages/oauth"
import ProviderPage from "../../pages/provider"
import ProvidersPage from "../../pages/providers"
import TablePage from "../../pages/table"
import TablesPage from "../../pages/tables"
import TemplatePage from "../../pages/template"
import TemplateAutomationsPage from "../../pages/template-automations"
import TemplatesPage from "../../pages/templates"
import TriggersPage from "../../pages/triggers"
import TryOutPage from "../../pages/try-out"
import UserGroupsPage from "../../pages/user-groups"
import UserManagementPage from "../../pages/user-management"
import { ViewPage } from "../../pages/view"
import WorkflowsPage from "../../pages/workflows"
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
		path: "/builder/projects/:projectName/providers/:providerName",
		element: <ProviderPage />,
	},
	{
		path: "/builder/projects/:projectName/providers",
		element: <ProvidersPage />,
	},
	{
		path: "/builder/projects/:projectName/workflows/interaction/:name/executions/:id",
		element: <ExecutionPage kind="interaction" />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows/interaction/:name/executions",
		element: <HistoryPage kind="interaction" />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows/interaction/new",
		element: <InteractionPage />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows/interaction/:name",
		element: <InteractionPage />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows",
		compactSidebar: true,
		element: <WorkflowsPage />,
	},
	{
		path: "/builder/projects/:projectName/workflows/template/:name",
		compactSidebar: true,
		element: <TemplatePage />,
	},
	{
		path: "/builder/projects/:projectName/workflows/template/new",
		compactSidebar: true,
		element: <TemplatePage />,
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
		path: "/builder/projects/:projectName/workflows/interaction/:name/executions/:id",
		element: <ExecutionPage kind="interaction" />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/interactions/:name/executions",
		element: <HistoryPage kind="interaction" />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows/interaction",
		element: <InteractionPage />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows/:name",
		element: <InteractionPage />,
		compactSidebar: true,
	},
	{
		path: "/builder/projects/:projectName/workflows",
		element: <WorkflowsPage />,
	},
	{
		path: "/builder/projects/:projectName/templates/template",
		element: <TemplatePage />,
	},
	{
		path: "/builder/projects/:projectName/templates/:name",
		element: <TemplatePage />,
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
		path: "/builder/projects/:projectName/interactions/:name/executions/:id",
		element: <ExecutionPage kind="interaction" />,
	},
	{
		path: "/builder/projects/:projectName/workflows/interaction/:name/executions",
		element: <HistoryPage kind="interaction" />,
	},
	{
		path: "/builder/projects/:projectName/templates/new",
		element: <TemplatePage />,
	},
	{
		path: "/builder/projects/:projectName/templates/:name",
		element: <TemplatePage />,
	},
	{
		path: "/builder/projects/:projectName/interactions/new",
		element: <InteractionPage />,
	},
	{
		path: "/builder/projects/:projectName/interactions/:name",
		element: <InteractionPage />,
	},
	{
		path: "/builder/projects/:projectName/interactions",
		element: <InteractionsPage />,
	},
	{
		path: "/builder/projects/:projectName/templates/new",
		element: <TemplatePage />,
	},
	{
		path: "/builder/projects/:projectName/templates/:name",
		element: <TemplatePage />,
	},
	{
		path: "/builder/projects/:projectName/templates/:name/automations",
		element: <TemplateAutomationsPage />,
	},
	{
		path: "/builder/projects/:projectName/templates",
		element: <TemplatesPage />,
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
		path: "/builder/projects/:projectName/automations/:name/executions/:id",
		element: <ExecutionPage />,
	},
	{
		path: "/builder/projects/:projectName/workflows/automations/:name",
		element: <AutomationPage />,
		compactSidebar: true,
	},
	{
		path: "/try-out",
		element: <TryOutPage />,
	},
	{
		path: "/integrations/add",
		element: <OauthPage />,
	},
	{
		path: "/integrations",
		element: <IntegrationsPage />,
	},
	{
		path: "/triggers",
		element: <TriggersPage />,
	},
	{
		path: "/automations/automation/new",
		element: <AutomationPage />,
		withoutSidebar: true,
	},
	{
		path: "/automations/:name/executions/:id",
		element: <ExecutionPage />,
		withoutSidebar: true,
	},
	{
		path: "/automations/:name/executions",
		element: <HistoryPage />,
		withoutSidebar: true,
	},
	{
		path: "/automations/automation/:name",
		element: <AutomationPage />,
		withoutSidebar: true,
	},
	{
		path: "/automations",
		element: <AutomationsPage />,
		// withoutSidebar: true,
	},
	{
		path: "/automations/yaml/import",
		element: <ImportYamlPage />,
		withoutSidebar: true,
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
	const location = useLocation()
	const { width } = useViewportSize()
	useEffect(() => {
		if (!IS_LOCAL) {
			const token = Cookies.get("dotenx")
			if (!token) window.location.replace(ADMIN_URL)
		}
	}, [location])
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
