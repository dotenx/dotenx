import { AppShell, Drawer } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import { COMPONENTS } from '../components'
import { previewAtom, TopBar } from '../page/top-bar'
import { useSelectionStore } from '../selection/selection-store'
import { useSelectedElement } from '../selection/use-selected-component'
import { AppHeader } from '../ui/header'
import { SimpleLeftSidebar } from './left-sidebar'
import { SimpleRightSidebar } from './right-sidebar'
import { insertingAtom, SimpleCanvas } from './simple-canvas'

export function Simple() {
	const { isFullscreen } = useAtomValue(previewAtom)
	const sidebars = isFullscreen ? {} : { navbar: <Navbar />, aside: <Aside /> }

	return (
		<AppShell
			header={
				<AppHeader>
					<TopBar />
				</AppHeader>
			}
			padding={0}
			{...sidebars}
		>
			<SimpleCanvas />
		</AppShell>
	)
}

const Navbar = () => {
	const [inserting, setInserting] = useAtom(insertingAtom)

	return (
		<Drawer
			size={310}
			opened={!!inserting}
			onClose={() => setInserting(null)}
			overlayProps={{ opacity: 0.1 }}
			padding="md"
			className="overflow-y-scroll"
			withCloseButton={false}
		>
			<SimpleLeftSidebar components={COMPONENTS} />
		</Drawer>
	)
}

const Aside = () => {
	const selectedElement = useSelectedElement()
	const deselect = useSelectionStore((store) => store.deselect)

	return (
		<Drawer
			size={310}
			opened={!!selectedElement}
			onClose={deselect}
			overlayProps={{ opacity: 0.1 }}
			padding="md"
			className="overflow-y-scroll"
			position="right"
			withCloseButton={false}
		>
			<SimpleRightSidebar />
		</Drawer>
	)
}
