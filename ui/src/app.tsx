import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Integrations from './pages/integrations'
import Oauth from './pages/oauth'
import Triggers from './pages/triggers'
import './styles/global.css'

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/integrations/add" element={<Oauth />} />
				<Route path="/integrations" element={<Integrations />} />
				<Route path="/triggers" element={<Triggers />} />
			</Routes>
		</BrowserRouter>
	)
}
