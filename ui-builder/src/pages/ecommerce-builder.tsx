import { AppShell } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { ECOMMERCE_COMPONENTS } from '../features/ecommerce'
import { PageActions } from '../features/page/actions'
import { PageSelection } from '../features/page/page-selection'
import {
	FullscreenButton,
	Logo,
	PageScaling,
	previewAtom,
	TopBarWrapper,
	UndoRedo,
	UnsavedMessage,
	useFetchPage,
	useFetchProjectTag,
} from '../features/page/top-bar'
import { SimpleLeftSidebar } from '../features/simple/left-sidebar'
import { SimpleRightSidebar } from '../features/simple/right-sidebar'
import { SimpleCanvas } from '../features/simple/simple-canvas'
import { AppHeader } from '../features/ui/header'
import { LeftSidebar } from '../features/ui/left-sidebar'
import { RightSidebar } from '../features/ui/right-sidebar'
import { ViewportSelection } from '../features/viewport/viewport-selection'

export function EcommerceBuilder() {
	useFetchProjectTag()
	useFetchPage()
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
	return (
		<TopBarWrapper
			left={
				<>
					<Logo />
					<PageSelection />
					<ViewportSelection />
					<FullscreenButton />
					<UnsavedMessage />
				</>
			}
			right={
				<>
					<PageScaling />
					<UndoRedo />
					<PageActions showSettings={false} />
				</>
			}
		/>
	)
}

const Navbar = () => (
	<LeftSidebar>
		<SimpleLeftSidebar components={ECOMMERCE_COMPONENTS} />
	</LeftSidebar>
)

const Aside = () => (
	<RightSidebar>
		<SimpleRightSidebar />
	</RightSidebar>
)
