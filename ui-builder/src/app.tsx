import { createEmotionCache, MantineProvider, MantineThemeOverride } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { ReactNode, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BuilderPage } from './pages/builder'
import CreateAIWebsitePage from './pages/create-ai-website-page'
import { EcommerceBuilder } from './pages/ecommerce-builder'
import { ExtensionDetailsPage } from './pages/extension'
import { ExtensionCreatePage } from './pages/extension-create'
import { ExtensionEditPage } from './pages/extension-edit'
import { ExtensionsPage } from './pages/extensions'
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
			<MantineProvider
				withNormalizeCSS
				withGlobalStyles
				emotionCache={emotionCache}
				theme={theme}
			>
				<Notifications />
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
	useCheckAuth()

	return (
		<Layout>
			<Routes>
				<Route path="/ecommerce/:projectName/:pageName" element={<EcommerceBuilder />} />
				<Route path="/extensions-edit/:projectName/:name" element={<ExtensionEditPage />} />
				<Route path="/extensions-create/:projectName" element={<ExtensionCreatePage />} />
				<Route path="/extensions/:projectName/:name" element={<ExtensionDetailsPage />} />
				<Route path="/extensions/:projectName" element={<ExtensionsPage />} />
				<Route path="/projects/:projectName/:pageName" element={<BuilderPage />} />
				<Route path="/projects/:projectName" element={<Navigate to="index" replace />} />
				<Route path="/ai/create" element={<CreateAIWebsitePage />} />
				<Route path="/*" element={<NotFoundPage />} />
			</Routes>
		</Layout>
	)
}

const useCheckAuth = () => {
	const location = useLocation()
	useEffect(() => {
		if (import.meta.env.VITE_ADMIN_IS_LOCAL === 'true') return
		const token = Cookies.get('dotenx')
		if (!token) window.location.replace(import.meta.env.VITE_ADMIN_PANEL_URL)
	}, [location])
}

function Layout({ children }: { children: ReactNode }) {
	return <div className="text-slate-700">{children}</div>
}
