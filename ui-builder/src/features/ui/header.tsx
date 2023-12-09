import { Header } from '@mantine/core'
import { ReactNode } from 'react'

export function AppHeader({ children }: { children: ReactNode }) {
	return (
		<Header height={60} style={{ zIndex: 110 }}>
			{children}
		</Header>
	)
}
