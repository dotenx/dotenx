import Cookies from 'js-cookie'
import { useEffect } from 'react'
import { Navigate, Route, Routes as ReactRoutes, useLocation } from 'react-router-dom'
import { ADMIN_URL, IS_LOCAL } from '../../constants'
import AutomationPage from '../../pages/automation'
import AutomationsPage from '../../pages/automations'
import ExecutionPage from '../../pages/execution'
import HistoryPage from '../../pages/history'
import ImportYamlPage from '../../pages/import-yaml'
import IntegrationsPage from '../../pages/integrations'
import NotFoundPage from '../../pages/not-found'
import OauthPage from '../../pages/oauth'
import ProviderPage from '../../pages/provider'
import ProvidersPage from '../../pages/providers'
import TablePage from '../../pages/table'
import TablesPage from '../../pages/tables'
import TemplatePage from '../../pages/template'
import TemplatesPage from '../../pages/templates'
import TriggersPage from '../../pages/triggers'
import TryOutPage from '../../pages/try-out'
import UserManagementPage from '../../pages/user-management'
import { Layout } from '../ui'

const routes = [
	{ path: '/builder/projects/:projectName/providers/:providerName', element: <ProviderPage /> },
	{ path: '/builder/projects/:projectName/providers', element: <ProvidersPage /> },
	{ path: '/builder/projects/:projectName/tables/:tableName', element: <TablePage /> },
	{ path: '/builder/projects/:projectName/tables', element: <TablesPage /> },
	{ path: '/builder/projects/:projectName/templates/:name', element: <TemplatePage /> },
	{ path: '/builder/projects/:projectName/templates/new', element: <TemplatePage /> },
	{ path: '/builder/projects/:projectName/templates', element: <TemplatesPage /> },
	{ path: '/builder/projects/:projectName/user-management', element: <UserManagementPage /> },

	{ path: '/try-out', element: <TryOutPage /> },
	{ path: '/integrations/add', element: <OauthPage /> },
	{ path: '/integrations', element: <IntegrationsPage /> },
	{ path: '/triggers', element: <TriggersPage /> },
	{ path: '/automations/new', element: <AutomationPage /> },
	{ path: '/automations/:name/executions/:id', element: <ExecutionPage /> },
	{ path: '/automations/:name/executions', element: <HistoryPage /> },
	{ path: '/automations/:name', element: <AutomationPage /> },
	{ path: '/automations', element: <AutomationsPage /> },
	{ path: '/automations/yaml/import', element: <ImportYamlPage /> },
	{ path: '/', element: <Navigate replace to="/automations" /> },
	{ path: '/*', element: <NotFoundPage /> },
]

export function Routes() {
	const location = useLocation()

	useEffect(() => {
		if (!IS_LOCAL) {
			const token = Cookies.get('dotenx')
			if (!token) window.location.replace(ADMIN_URL)
		}
	}, [location])

	return (
		<ReactRoutes>
			{routes.map((route) => (
				<Route
					key={route.path}
					path={route.path}
					element={<Layout>{route.element}</Layout>}
				/>
			))}
		</ReactRoutes>
	)
}
