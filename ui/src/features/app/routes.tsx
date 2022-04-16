import { Navigate, Route, Routes as ReactRoutes } from 'react-router-dom'
import AutomationPage from '../../pages/automation'
import AutomationsPage from '../../pages/automations'
import IntegrationsPage from '../../pages/integrations'
import OauthPage from '../../pages/oauth'
import TriggersPage from '../../pages/triggers'

export function Routes() {
	return (
		<ReactRoutes>
			<Route path="/integrations/add" element={<OauthPage />} />
			<Route path="/integrations" element={<IntegrationsPage />} />
			<Route path="/triggers" element={<TriggersPage />} />
			<Route path="/automations/:name" element={<AutomationPage />} />
			<Route path="/automations-new" element={<AutomationPage />} />
			<Route path="/automations" element={<AutomationsPage />} />
			<Route path="/" element={<Navigate replace to="/automations" />} />
		</ReactRoutes>
	)
}
