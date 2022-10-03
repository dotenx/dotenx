import { Collapse, Divider } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReactNode } from 'react'
import { TbChevronDown, TbChevronUp } from 'react-icons/tb'

export function CollapseLine({
	children,
	label,
	defaultClosed,
}: {
	children: ReactNode
	label: string
	defaultClosed?: boolean
}) {
	const [opened, handlers] = useDisclosure(!defaultClosed)

	return (
		<div>
			<Divider
				label={
					<div className="flex items-center gap-1">
						{opened ? <TbChevronUp /> : <TbChevronDown />}
						{label}
					</div>
				}
				className="rounded cursor-pointer hover:bg-gray-50"
				mb="xs"
				onClick={handlers.toggle}
			/>
			<Collapse in={opened}>{children}</Collapse>
		</div>
	)
}
