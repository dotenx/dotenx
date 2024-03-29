import { AppShell, Button, Divider, Drawer, Text, Tooltip } from '@mantine/core'
import { openModal } from '@mantine/modals'
import { useAtom, useAtomValue } from 'jotai'
import { TbSettings } from 'react-icons/tb'
import { COMPONENTS } from '../components'
import { CustomCodes, PageActions } from '../page/actions'
import { PageSelection } from '../page/page-selection'
import {
	AdvancedModeButton,
	DashboardLink,
	FullscreenButton,
	Logo,
	PageScaling,
	TopBarWrapper,
	UndoRedo,
	UnsavedMessage,
	previewAtom,
	projectTypeAtom,
} from '../page/top-bar'
import { usePageData } from '../page/use-update'
import { useSelectionStore } from '../selection/selection-store'
import { useSelectedElement } from '../selection/use-selected-component'
import { AppHeader } from '../ui/header'
import { ViewportSelection } from '../viewport/viewport-selection'
import { SimpleLeftSidebar } from './left-sidebar'
import { Palette } from './palette'
import { SimpleRightSidebar } from './right-sidebar'
import { SimpleCanvas, insertingAtom } from './simple-canvas'

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

function TopBar() {
	const projectType = useAtomValue(projectTypeAtom)

	return (
		<TopBarWrapper
			left={
				<>
					<Logo />
					<DashboardLink />
					{projectType !== 'landing_page' && <PageSelection />}
					<ViewportSelection />
					<FullscreenButton />
					<UnsavedMessage />
				</>
			}
			right={
				<>
					<PageScaling />
					<UndoRedo />
					<PageActions settings={<PageSettings />} />
				</>
			}
		/>
	)
}

function PageSettings() {
	const pageData = usePageData()

	return (
		<Tooltip withinPortal withArrow label={<Text size="xs">Settings</Text>}>
			<Button
				onClick={() =>
					openModal({
						title: 'Page Settings',
						children: (
							<div>
								<Palette />
								<Divider label="Custom code" my="xl" />
								<CustomCodes />
								<AdvancedModeButton pageData={pageData} />
							</div>
						),
					})
				}
				size="xs"
				variant="default"
			>
				<TbSettings className="w-5 h-5" />
			</Button>
		</Tooltip>
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
			keepMounted
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
			keepMounted
		>
			<SimpleRightSidebar />
		</Drawer>
	)
}
