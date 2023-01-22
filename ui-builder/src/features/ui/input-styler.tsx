import { ActionIcon, Drawer } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReactNode } from 'react'
import { TbDroplet } from 'react-icons/tb'

export function InputStyler({ children }: { children: ReactNode }) {
	const [opened, openedHandlers] = useDisclosure(false)

	return (
		<>
			<ActionIcon size="xs" onClick={openedHandlers.toggle}>
				<TbDroplet size={12} />
			</ActionIcon>
			<Drawer
				opened={opened}
				onClose={openedHandlers.close}
				position="right"
				padding="lg"
				overlayOpacity={0}
				size={310}
			>
				{children}
			</Drawer>
		</>
	)
}
