import { Theme, ThemeProvider } from '@emotion/react'
import { useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import ReactModal from 'react-modal'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import '../../styles/global.css'
import { Routes } from './routes'

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

export function App() {
	useEffect(() => {
		ReactModal.setAppElement('#root')
	}, [])

	return (
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<ReactFlowProvider>
						<Routes />
					</ReactFlowProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</BrowserRouter>
	)
}
