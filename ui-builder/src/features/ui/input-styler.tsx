import { ActionIcon, CloseButton, Popover, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReactNode } from 'react'
import { TbDroplet } from 'react-icons/tb'

export function InputStyler({ children }: { children: ReactNode }) {
	const [opened, openedHandlers] = useDisclosure(false)

	return (
		<Popover
			shadow="md"
			position="left"
			withinPortal
			width={300}
			closeOnClickOutside={false}
			opened={opened}
		>
			<Popover.Target>
				<ActionIcon size="xs" onClick={openedHandlers.toggle}>
					<TbDroplet size={12} />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown sx={{ padding: 0 }}>
				<CloseButton onClick={openedHandlers.close} size="xs" ml="auto" />
				<ScrollArea sx={{ height: 400, padding: '0 16px 12px 16px' }} offsetScrollbars>
					{children}
				</ScrollArea>
			</Popover.Dropdown>
		</Popover>
	)
}
