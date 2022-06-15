import Cookies from 'js-cookie'
import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom'
import { ADMIN_URL, IS_LOCAL } from '../../constants'
import AutomationPage from '../../pages/automation'
import AutomationsPage from '../../pages/automations'
import ExecutionPage from '../../pages/execution'
import HistoryPage from '../../pages/history'
import ImportYamlPage from '../../pages/import-yaml'
import IntegrationsPage from '../../pages/integrations'
import OauthPage from '../../pages/oauth'
import ProvidersPage from '../../pages/providers'
import TriggersPage from '../../pages/triggers'

export function Routes() {
	if (!IS_LOCAL) {
		const token = Cookies.get('dotenx')
		if (!token) window.location.replace(ADMIN_URL)
	}

	return (
		<ReactRoutes>
			<Route path="/providers" element={<ProvidersPage />} />
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
