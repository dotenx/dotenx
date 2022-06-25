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
import OauthPage from '../../pages/oauth'
import ProjectPage from '../../pages/project'
import ProjectsPage from '../../pages/projects'
import ProviderPage from '../../pages/provider'
import ProvidersPage from '../../pages/providers'
import TablePage from '../../pages/table'
import TriggersPage from '../../pages/triggers'
import TryOutPage from '../../pages/try-out'
import Authentication from '../../pages/authentication'

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
<<<<<<< HEAD
			<Route path="/builder/authentication" element={<Authentication />} />
=======
			<Route path="/builder/projects/:projectName/tables/:name" element={<TablePage />} />
			<Route path="/builder/projects/:name" element={<ProjectPage />} />
			<Route path="/builder/projects" element={<ProjectsPage />} />
>>>>>>> main
			<Route path="/builder/providers/:name" element={<ProviderPage />} />
			<Route path="/builder/providers" element={<ProvidersPage />} />
			<Route path="/builder" element={<Navigate replace to="/builder/projects"  />} />

			<Route path="/try-out" element={<TryOutPage />} />
			<Route path="/integrations/add" element={<OauthPage />} />
			<Route path="/integrations" element={<IntegrationsPage />} />
			<Route path="/triggers" element={<TriggersPage />} />
			<Route path="/automations/:name/executions/:id" element={<ExecutionPage />} />
			<Route path="/automations/:name/executions" element={<HistoryPage />} />
			<Route path="/automations/:name" element={<AutomationPage />} />
			<Route path="/automations-new" element={<AutomationPage />} />
			<Route path="/automations" element={<AutomationsPage />} />
			<Route path="/automations/yaml/import" element={<ImportYamlPage />} />
			<Route path="/" element={<Navigate replace to="/automations" />} />
		</ReactRoutes>
	)
}
