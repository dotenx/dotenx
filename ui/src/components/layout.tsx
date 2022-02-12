import { Theme, ThemeProvider } from '@emotion/react'
import { ReactNode, useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import ReactModal from 'react-modal'
import { QueryClient, QueryClientProvider } from 'react-query'
import '../styles/global.css'

const theme: Theme = {
	color: {
		primary: '#1D3557',
		positive: '#2A9D8F',
		negative: '#E63946',
		text: '#222222',
		background: '#FFFFFC',
	},
}

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})

interface LayoutProps {
	children: ReactNode
}

export function Layout({ children }: LayoutProps) {
	useEffect(() => {
		ReactModal.setAppElement('#root')
	}, [])

	return (
		<div id="root">
			<ThemeProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<ReactFlowProvider>{children}</ReactFlowProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</div>
	)
}
