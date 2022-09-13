import { AppShell, Aside, Header, Navbar, ScrollArea } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useParams } from 'react-router-dom'
import { Canvas } from '../features/canvas'
import { ComponentSelectorAndLayers } from '../features/component-selector'
import { Settings } from '../features/settings'
import { fullScreenAtom, TopBar } from '../features/top-bar'

export function HomePage() {
	const { projectName = '' } = useParams()
	const { isFullscreen } = useAtomValue(fullScreenAtom)

	const sidebars = isFullscreen ? {} : { navbar: <AppLeftSideBar />, aside: <AppRightSideBar /> }

	return (
		<DndProvider backend={HTML5Backend}>
			<AppShell header={<AppHeader projectName={projectName} />} {...sidebars} padding={0}>
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
		<Navbar width={{ base: 310 }}>
			<Navbar.Section
				component={ScrollArea}
				grow
				scrollbarSize={0}
				scrollHideDelay={0}
				offsetScrollbars
			>
				<div className="py-2 px-4">
					<ComponentSelectorAndLayers />
				</div>
			</Navbar.Section>
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
