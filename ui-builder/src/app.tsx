import { AppShell, Aside, createEmotionCache, Header, MantineProvider, Navbar } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Canvas } from './features/canvas'
import { CanvasWrapper } from './features/canvas-wrapper'
import { Settings } from './features/settings'
import { SideBar } from './features/side-bar'
import { TopBar } from './features/top-bar'

const queryClient = new QueryClient()
const emotionCache = createEmotionCache({ key: 'mantine' })

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider emotionCache={emotionCache}>
				<ModalsProvider>
					<div className="text-slate-700">
						<CanvasWrapper>
							<AppShell
								header={
									<Header height={60} sx={{ zIndex: 110 }}>
										<TopBar />
									</Header>
								}
								navbar={
									<Navbar width={{ base: 310 }} p="xl">
										<SideBar />
									</Navbar>
								}
								aside={
									<Aside width={{ base: 310 }} p="xl">
										<Settings />
									</Aside>
								}
								padding={0}
							>
								<Canvas />
							</AppShell>
						</CanvasWrapper>
					</div>
				</ModalsProvider>
			</MantineProvider>
		</QueryClientProvider>
	)
}
