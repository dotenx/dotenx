import { Navbar, ScrollArea } from '@mantine/core'
import { useClickOutside } from '@mantine/hooks'
import { useSetAtom } from 'jotai'
import { ReactNode } from 'react'
import { insertingAtom } from '../simple/simple-canvas'

export function LeftSidebar({ children }: { children: ReactNode }) {
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
				<div className="py-2 px-4">{children}</div>
			</Navbar.Section>
		</Navbar>
	)
}
