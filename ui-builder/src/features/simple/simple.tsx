import { AppShell } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { COMPONENTS } from '../components'
import { previewAtom, TopBar } from '../page/top-bar'
import { AppHeader } from '../ui/header'
import { LeftSidebar } from '../ui/left-sidebar'
import { RightSidebar } from '../ui/right-sidebar'
import { SimpleLeftSidebar } from './left-sidebar'
import { SimpleRightSidebar } from './right-sidebar'
import { SimpleCanvas } from './simple-canvas'

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

const Navbar = () => (
	<LeftSidebar>
		<SimpleLeftSidebar components={COMPONENTS} />
	</LeftSidebar>
)

const Aside = () => (
	<RightSidebar>
		<SimpleRightSidebar />
	</RightSidebar>
)
