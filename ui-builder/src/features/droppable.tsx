import { useDroppable } from '@dnd-kit/core'
import { clsx } from '@mantine/core'
import { ReactNode } from 'react'

export interface DroppableData {
	mode: DroppableMode
	componentId: string
}

export enum DroppableMode {
	InsertIn = 'insert-in',
	InsertBefore = 'insert-before',
	InsertAfter = 'insert-after',
}

export function Droppable({
	children,
	className,
	id,
	onClick,
	data,
}: {
	children?: ReactNode
	className?: string
	id: string
	onClick?: () => void
	data: DroppableData
}) {
	const { isOver, setNodeRef } = useDroppable({ id, data })

	return (
		<div
			ref={setNodeRef}
			className={clsx(isOver && 'outline outline-1', className)}
			onClick={onClick}
		>
			{children}
		</div>
	)
}
