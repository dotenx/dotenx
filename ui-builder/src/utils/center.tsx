import { Center } from '@mantine/core'
import { ReactNode } from 'react'

export const toCenter = (layout: { label: ReactNode; title: string; value: string }) => ({
	label: (
		<Center className="text-sm" title={layout.title}>
			{layout.label}
		</Center>
	),
	value: layout.value,
})
