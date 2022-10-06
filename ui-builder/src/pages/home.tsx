import { AppShell, Aside, Header, Navbar, ScrollArea } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { AdvancedCanvas } from '../features/advanced/canvas'
import { ElementDraggerAndLayers } from '../features/advanced/element-dragger-layer'
import { ElementAdvancedSettings } from '../features/advanced/settings'
import { previewAtom, TopBar } from '../features/page/top-bar'

export function HomePage() {
	const { isFullscreen } = useAtomValue(previewAtom)
	const sidebars = isFullscreen ? {} : { navbar: <AppLeftSideBar />, aside: <AppRightSideBar /> }

	return (
		<DndProvider backend={HTML5Backend}>
			<AppShell header={<AppHeader />} {...sidebars} padding={0}>
				<AdvancedCanvas />
			</AppShell>
		</DndProvider>
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
		<Navbar width={{ base: 310 }}>
			<Navbar.Section
				component={ScrollArea}
				grow
				scrollbarSize={0}
				scrollHideDelay={0}
				offsetScrollbars
			>
				<div className="py-2 px-4">
					<ElementDraggerAndLayers />
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
					<ElementAdvancedSettings />
				</div>
			</Aside.Section>
		</Aside>
	)
}
