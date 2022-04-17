import { useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import ReactModal from 'react-modal'
import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter } from 'react-router-dom'
import '../../styles/global.css'
import { Routes } from './routes'

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

export function App() {
	useEffect(() => {
		ReactModal.setAppElement('#root')
	}, [])

	return (
		<BrowserRouter>
			<QueryClientProvider client={queryClient}>
				<ReactFlowProvider>
					<Routes />
				</ReactFlowProvider>
			</QueryClientProvider>
		</BrowserRouter>
	)
}
