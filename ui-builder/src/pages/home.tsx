import { AppShell, Aside, Header, Navbar, ScrollArea } from '@mantine/core'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useParams } from 'react-router-dom'
import { Canvas } from '../features/canvas'
import { ComponentSelectorAndLayers } from '../features/component-selector'
import { Settings } from '../features/settings'
import { TopBar } from '../features/top-bar'

export function HomePage() {
	const { projectName = '' } = useParams()

	return (
		<DndProvider backend={HTML5Backend}>
			<AppShell
				header={<AppHeader projectName={projectName} />}
				navbar={<AppLeftSideBar />}
				aside={<AppRightSideBar />}
				padding={0}
			>
				<Canvas />
			</AppShell>
		</DndProvider>
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
		<Aside width={{ base: 310 }}>
			<Aside.Section
				component={ScrollArea}
				grow
				scrollbarSize={4}
				scrollHideDelay={0}
				offsetScrollbars
				mx="-xs"
				px="xl"
			>
				<div className="py-2 px-1">
					<Settings />
				</div>
			</Aside.Section>
		</Aside>
	)
}
