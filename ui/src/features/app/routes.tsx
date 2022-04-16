import { Route, Routes as ReactRoutes } from 'react-router-dom'
import Automations from '../../pages/automations'
import Home from '../../pages/home'
import Integrations from '../../pages/integrations'
import Oauth from '../../pages/oauth'
import Triggers from '../../pages/triggers'

export function Routes() {
	return (
		<ReactRoutes>
			<Route path="/integrations/add" element={<Oauth />} />
			<Route path="/integrations" element={<Integrations />} />
			<Route path="/triggers" element={<Triggers />} />
			<Route path="/automations" element={<Automations />} />
			<Route path="/" element={<Home />} />
		</ReactRoutes>
	)
}
