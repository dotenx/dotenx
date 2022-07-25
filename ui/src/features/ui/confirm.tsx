import { Button, Popover } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReactNode } from 'react'

export function Confirm({
	confirmText,
	onConfirm,
	target,
}: {
	confirmText: string
	onConfirm: () => void
	target: (open: () => void) => ReactNode
}) {
	const [opened, handlers] = useDisclosure(false)

	return (
		<Popover opened={opened} onClose={handlers.close} withArrow position="bottom">
			<Popover.Target>{target(handlers.open)}</Popover.Target>
			<Popover.Dropdown>
				<div className="flex flex-col gap-6">
					<p className="text-sm">{confirmText}</p>
					<Button type="button" onClick={onConfirm}>
						Confirm Delete
					</Button>
				</div>
			</Popover.Dropdown>
		</Popover>
	)
}
