import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { clsx } from '@mantine/core'
import { ReactNode } from 'react'
import { ComponentKind } from './canvas-store'

export type DraggableData =
	| {
			mode: DraggableMode.Add
			kind: ComponentKind
	  }
	| {
			mode: DraggableMode.Move
			componentId: string
	  }

export enum DraggableMode {
	Add = 'add',
	Move = 'move',
}

export function Draggable({
	children,
	id,
	data,
}: {
	children: ReactNode
	id: string
	data: DraggableData
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id, data })
	const style = { transform: CSS.Translate.toString(transform) }

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={clsx('cursor-grab grow', isDragging && 'z-10 relative opacity-50')}
			{...listeners}
			{...attributes}
		>
			{children}
		</div>
	)
}
