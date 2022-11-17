import { AppShell, Aside, Header, Navbar, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TbArrowLeft, TbArrowRight } from 'react-icons/tb'
import { previewAtom, TopBar } from '../page/top-bar'
import { AdvancedCanvas } from './canvas'
import { ElementDraggerAndLayers } from './element-dragger-layer'
import { ElementAdvancedSettings } from './settings'

export function Advanced() {
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
	const [opened, disclosure] = useDisclosure(true)

	return (
		<Navbar width={{ base: opened ? 310 : 40 }} className="relative">
			<button
				className="absolute hover:bg-gray-50 z-10 p-1 rounded-bl text-gray-500 right-0"
				onClick={disclosure.toggle}
			>
				{opened ? <TbArrowLeft /> : <TbArrowRight />}
			</button>
			<Navbar.Section
				component={ScrollArea}
				grow
				scrollbarSize={0}
				scrollHideDelay={0}
				offsetScrollbars
				hidden={!opened}
			>
				<div className="py-2 px-4 mt-4">
					<ElementDraggerAndLayers />
				</div>
			</Navbar.Section>
		</Navbar>
	)
}

function AppRightSideBar() {
	const [opened, disclosure] = useDisclosure(true)

	return (
		<Aside width={{ base: opened ? 310 : 40 }} className="relative">
			<button
				className="absolute hover:bg-gray-50 z-10 p-1 rounded-bl text-gray-500 left-0"
				onClick={disclosure.toggle}
			>
				{opened ? <TbArrowRight /> : <TbArrowLeft />}
			</button>
			<Aside.Section
				component={ScrollArea}
				grow
				scrollbarSize={4}
				scrollHideDelay={0}
				offsetScrollbars
				mx="-xs"
				px="xl"
				hidden={!opened}
			>
				<div className="py-2 px-1 mt-4">
					<ElementAdvancedSettings />
				</div>
			</Aside.Section>
		</Aside>
	)
}
