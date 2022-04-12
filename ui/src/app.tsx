import { Theme, ThemeProvider } from '@emotion/react'
import { ReactNode, useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import ReactModal from 'react-modal'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home'
import Integrations from './pages/integrations'
import Oauth from './pages/oauth'
import Triggers from './pages/triggers'
import './styles/global.css'

export const theme: Theme = {
	color: {
		primary: '#e85d04',
		positive: '#90be6d',
		negative: '#ef233c',
		text: '#222222',
		background: '#FFFFFC',
	},
}

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

type ProvidersProps = {
	children: ReactNode
}

function Providers({ children }: ProvidersProps) {
	useEffect(() => {
		ReactModal.setAppElement('#root')
	}, [])

	return (
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<ReactFlowProvider>{children}</ReactFlowProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</BrowserRouter>
	)
}

export default function App() {
	return (
		<Providers>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/integrations/add" element={<Oauth />} />
				<Route path="/integrations" element={<Integrations />} />
				<Route path="/triggers" element={<Triggers />} />
			</Routes>
		</Providers>
	)
}
