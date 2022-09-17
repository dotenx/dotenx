import { createEmotionCache, MantineProvider, MantineThemeOverride } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { ReactNode, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { HomePage } from './pages/home'
import { NotFoundPage } from './pages/not-found'

const queryClient = new QueryClient({
	defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
})
const emotionCache = createEmotionCache({ key: 'mantine' })
const theme: MantineThemeOverride = {
	colors: {
		rose: [
			'#fff1f2',
			'#ffe4e6',
			'#fecdd3',
			'#fda4af',
			'#fb7185',
			'#f43f5e',
			'#e11d48',
			'#be123c',
			'#9f1239',
			'#881337',
		],
	},
	primaryColor: 'rose',
	fontFamily: "'Inter', sans-serif",
	fontFamilyMonospace: 'monospace',
}

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider emotionCache={emotionCache} theme={theme}>
				<ModalsProvider>
					<BrowserRouter>
						<Router />
					</BrowserRouter>
				</ModalsProvider>
			</MantineProvider>
		</QueryClientProvider>
	)
}

function Router() {
	const location = useLocation()
	useEffect(() => {
		if (import.meta.env.VITE_ADMIN_IS_LOCAL === 'true') return
		const token = Cookies.get('dotenx')
		if (!token) window.location.replace(import.meta.env.VITE_ADMIN_PANEL_URL)
	}, [location])

	return (
		<Layout>
			<Routes>
				<Route path="/projects/:projectName" element={<HomePage />} />
				<Route path="/*" element={<NotFoundPage />} />
			</Routes>
		</Layout>
	)
}

function Layout({ children }: { children: ReactNode }) {
	return <div className="text-slate-700">{children}</div>
}
