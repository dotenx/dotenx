import { AppShell, Aside, Header, Navbar } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { Canvas } from '../features/canvas'
import { CanvasWrapper } from '../features/canvas-wrapper'
import { ComponentSelectorAndLayers } from '../features/component-selector'
import { Settings } from '../features/settings'
import { TopBar } from '../features/top-bar'

export function HomePage() {
	const { projectName = '' } = useParams()

	return (
		<CanvasWrapper>
			<AppShell
				header={<AppHeader projectName={projectName} />}
				navbar={<AppLeftSideBar />}
				aside={<AppRightSideBar />}
				padding={0}
			>
				<Canvas />
			</AppShell>
		</CanvasWrapper>
	)
}

function AppHeader({ projectName }: { projectName: string }) {
	return (
		<Header height={60} sx={{ zIndex: 110 }}>
			<TopBar projectName={projectName} />
		</Header>
	)
}

function AppLeftSideBar() {
	return (
		<Navbar width={{ base: 310 }} p="lg">
			<ComponentSelectorAndLayers />
		</Navbar>
	)
}

function AppRightSideBar() {
	return (
		<Aside width={{ base: 310 }} p="lg">
			<Settings />
		</Aside>
	)
}
