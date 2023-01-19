<<<<<<< HEAD
import { useViewportSize } from '@mantine/hooks'
import { Route, Routes as ReactRoutes } from 'react-router-dom'
import AutomationPage from '../../pages/automation'
import AutomationsPage from '../../pages/automations'
import DomainsPage from '../../pages/domains'
import ExecutionPage from '../../pages/execution'
import Files from '../../pages/files'
import HistoryPage from '../../pages/history'
import { HomePage } from '../../pages/home'
import ImportYamlPage from '../../pages/import-yaml'
import IntegrationsPage from '../../pages/integrations'
import InteractionPage from '../../pages/interaction'
import WorkflowsPage from '../../pages/workflows'
import NotFoundPage from '../../pages/not-found'
import OauthPage from '../../pages/oauth'
import ProviderPage from '../../pages/provider'
import ProvidersPage from '../../pages/providers'
import TablePage from '../../pages/table'
import TablesPage from '../../pages/tables'
import TemplatePage from '../../pages/template'
import TemplateAutomationsPage from '../../pages/template-automations'
import TemplatesPage from '../../pages/templates'
import TriggersPage from '../../pages/triggers'
import TryOutPage from '../../pages/try-out'
import UserGroupsPage from '../../pages/user-groups'
import UserManagementPage from '../../pages/user-management'
import { ViewPage } from '../../pages/view'
import { Layout } from '../ui'
import GitIntegrationPage from '../../pages/git/git'
import GitRedirectPage from '../../pages/git/git-redirect'
=======
import { useViewportSize } from "@mantine/hooks"
import { ReactNode } from "react"
import { Route, Routes as ReactRoutes } from "react-router-dom"
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
import { Layout } from "../ui"
>>>>>>> main

type Routes = {
	path: string
	element: ReactNode
	compactSidebar?: boolean
	withoutSidebar?: boolean
}[]

const routes: Routes = [
	{ path: "/builder/projects/:projectName/views/:viewName", element: <ViewPage /> },
	{ path: "/builder/projects/:projectName/providers/:providerName", element: <ProviderPage /> },
	{ path: "/builder/projects/:projectName/providers", element: <ProvidersPage /> },
	{
<<<<<<< HEAD
		path: '/builder/projects/:projectName/workflows/:name/executions/:id',
		element: <ExecutionPage kind="interaction" />,
	},
	{
		path: '/builder/projects/:projectName/workflows/:name/executions',
		element: <HistoryPage kind="interaction" />,
	},
	{ path: '/builder/projects/:projectName/workflows/interaction', element: <InteractionPage /> },
	{ path: '/builder/projects/:projectName/workflows/:name', element: <InteractionPage /> },
	{ path: '/builder/projects/:projectName/workflows', element: <WorkflowsPage /> },
	{ path: '/builder/projects/:projectName/templates/template', element: <TemplatePage /> },
	{ path: '/builder/projects/:projectName/templates/:name', element: <TemplatePage /> },
=======
		path: "/builder/projects/:projectName/tables/:tableName",
		element: <TablePage />,
		compactSidebar: true,
	},
	{ path: "/builder/projects/:projectName/tables/:tableName/:isPublic", element: <TablePage /> },
	{ path: "/builder/projects/:projectName/tables", element: <TablesPage /> },
	{ path: "/builder/projects/:projectName/git", element: <GitIntegrationPage /> },
	{ path: "/builder/git/integration/callback", element: <GitRedirectPage /> },

	{
		path: "/builder/projects/:projectName/interactions/:name/executions/:id",
		element: <ExecutionPage kind="interaction" />,
	},
	{
		path: "/builder/projects/:projectName/interactions/:name/executions",
		element: <HistoryPage kind="interaction" />,
	},
	{ path: "/builder/projects/:projectName/interactions/new", element: <InteractionPage /> },
	{ path: "/builder/projects/:projectName/interactions/:name", element: <InteractionPage /> },
	{ path: "/builder/projects/:projectName/interactions", element: <InteractionsPage /> },
	{ path: "/builder/projects/:projectName/templates/new", element: <TemplatePage /> },
	{ path: "/builder/projects/:projectName/templates/:name", element: <TemplatePage /> },
>>>>>>> main
	{
		path: "/builder/projects/:projectName/templates/:name/automations",
		element: <TemplateAutomationsPage />,
	},
	{ path: "/builder/projects/:projectName/templates", element: <TemplatesPage /> },
	{
		path: "/builder/projects/:projectName/user-management/user-groups",
		element: <UserGroupsPage />,
	},
	{ path: "/builder/projects/:projectName/user-management", element: <UserManagementPage /> },
	{ path: "/builder/projects/:projectName/files", element: <Files /> },
	{ path: "/builder/projects/:projectName/domains", element: <DomainsPage /> },
	{
		path: "/builder/projects/:projectName/automations/:name/executions/:id",
		element: <ExecutionPage />,
	},

	{ path: "/try-out", element: <TryOutPage /> },
	{ path: "/integrations/add", element: <OauthPage /> },
	{ path: "/integrations", element: <IntegrationsPage /> },
	{ path: "/triggers", element: <TriggersPage /> },
	{ path: "/automations/new", element: <AutomationPage /> },
	{ path: "/automations/:name/executions/:id", element: <ExecutionPage /> },
	{ path: "/automations/:name/executions", element: <HistoryPage /> },
	{ path: "/automations/:name", element: <AutomationPage /> },
	{ path: "/automations", element: <AutomationsPage /> },
	{ path: "/automations/yaml/import", element: <ImportYamlPage /> },
	{ path: "/", element: <HomePage />, withoutSidebar: true },
	{ path: "/*", element: <NotFoundPage />, withoutSidebar: true },
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
