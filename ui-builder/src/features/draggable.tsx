import { CSSProperties, ReactNode } from 'react'
import { useDrag } from 'react-dnd'
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

export enum DraggableKinds {
	Component = 'component',
}

export function Draggable({
	children,
	data,
	style,
}: {
	children: ReactNode
	data: DraggableData
	style?: CSSProperties
}) {
	const [, drag] = useDrag(() => ({ type: DraggableKinds.Component, item: data }))

	return (
		<div ref={drag} style={style}>
			{children}
		</div>
	)
}
