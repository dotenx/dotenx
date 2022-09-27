import { AppShell, Aside, Header, Navbar, ScrollArea } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { useAtomValue, useSetAtom } from 'jotai'
import { useParams } from 'react-router-dom'
import { ComponentInserter } from '../features/component-inserter'
import { insertingAtom, SimpleCanvas } from '../features/simple-canvas'
import { SimpleOptions } from '../features/simple-options'
import { fullScreenAtom, TopBar } from '../features/top-bar'

export function SimplePage() {
	const { projectName = '' } = useParams()
	const { isFullscreen } = useAtomValue(fullScreenAtom)
	const sidebars = isFullscreen ? {} : { navbar: <AppLeftSideBar />, aside: <AppRightSideBar /> }

	return (
		<AppShell header={<AppHeader projectName={projectName} />} {...sidebars} padding={0}>
			<SimpleCanvas />
		</AppShell>
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
					<ComponentInserter />
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
					<SimpleOptions />
				</div>
			</Aside.Section>
		</Aside>
	)
}
