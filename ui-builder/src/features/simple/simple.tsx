import { AppShell, Aside, Header, Navbar, ScrollArea } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { useAtomValue, useSetAtom } from 'jotai'
import { previewAtom, TopBar } from '../page/top-bar'
import { SimpleLeftSidebar } from './left-sidebar'
import { SimpleRightSidebar } from './right-sidebar'
import { insertingAtom, SimpleCanvas } from './simple-canvas'

export function Simple() {
	const { isFullscreen } = useAtomValue(previewAtom)
	const sidebars = isFullscreen ? {} : { navbar: <AppLeftSideBar />, aside: <AppRightSideBar /> }

	return (
		<AppShell header={<AppHeader />} padding={0} {...sidebars}>
			<SimpleCanvas />
		</AppShell>
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
	const setInserting = useSetAtom(insertingAtom)
	const outsideClickRef = useClickOutside(() => setInserting(null))

	return (
		<Navbar width={{ base: 310 }} ref={outsideClickRef}>
			<Navbar.Section
				component={ScrollArea}
				grow
				scrollbarSize={0}
				scrollHideDelay={0}
				offsetScrollbars
			>
				<div className="py-2 px-4">
					<SimpleLeftSidebar />
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
					<SimpleRightSidebar />
				</div>
			</Aside.Section>
		</Aside>
	)
}
