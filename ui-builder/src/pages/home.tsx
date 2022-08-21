import { AppShell, Aside, Header, Navbar } from '@mantine/core'
import { Canvas } from '../features/canvas'
import { CanvasWrapper } from '../features/canvas-wrapper'
import { ComponentSelectorAndLayers } from '../features/component-selector-and-layers'
import { Settings } from '../features/settings'
import { TopBar } from '../features/top-bar'

export function HomePage() {
	return (
		<CanvasWrapper>
			<AppShell
				header={<AppHeader />}
				navbar={<AppLeftSideBar />}
				aside={<AppRightSideBar />}
				padding={0}
			>
				<Canvas />
			</AppShell>
		</CanvasWrapper>
	)
}

function AppHeader() {
	return (
		<Header height={60} sx={{ zIndex: 110 }}>
			<TopBar />
		</Header>
	)
}

function AppLeftSideBar() {
	return (
		<Navbar width={{ base: 310 }} p="xl">
			<ComponentSelectorAndLayers />
		</Navbar>
	)
}

function AppRightSideBar() {
	return (
		<Aside width={{ base: 310 }} p="xl">
			<Settings />
		</Aside>
	)
}
