import { AppShell, Drawer } from '@mantine/core'
import { useAtom, useAtomValue } from 'jotai'
import { ECOMMERCE_COMPONENTS } from '../features/ecommerce'
import { PageActions } from '../features/page/actions'
import { PageSelection } from '../features/page/page-selection'
import {
	Logo,
	previewAtom,
	TopBarWrapper,
	UndoRedo,
	UnsavedMessage,
	useFetchPage,
	useFetchProjectTag,
} from '../features/page/top-bar'
import { useSelectionStore } from '../features/selection/selection-store'
import { useSelectedElement } from '../features/selection/use-selected-component'
import { SimpleLeftSidebar } from '../features/simple/left-sidebar'
import { SimpleRightSidebar } from '../features/simple/right-sidebar'
import { insertingAtom, SimpleCanvas } from '../features/simple/simple-canvas'
import { AppHeader } from '../features/ui/header'
import { ViewportSelection } from '../features/viewport/viewport-selection'

export function EcommerceBuilder() {
	useFetchProjectTag()
	useFetchPage()
	const { isFullscreen } = useAtomValue(previewAtom)
	const sidebars = isFullscreen ? {} : { navbar: <SimpleNavbar />, aside: <Aside /> }

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

function TopBar() {
	return (
		<TopBarWrapper
			left={
				<>
					<Logo />
					<PageSelection />
					<ViewportSelection />
					<UnsavedMessage />
				</>
			}
			right={
				<>
					<UndoRedo />
					<PageActions showSettings={false} />
				</>
			}
		/>
	)
}

const SimpleNavbar = () => {
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
			<SimpleLeftSidebar components={ECOMMERCE_COMPONENTS} />
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
