import { Aside, ScrollArea } from '@mantine/core'
import { ReactNode } from 'react'

export function RightSidebar({ children }: { children: ReactNode }) {
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
				<div className="py-2 px-1">{children}</div>
			</Aside.Section>
		</Aside>
	)
}
