import { useDrag } from 'react-dnd'
import { Component, ComponentKind } from './canvas-store'

export type DraggableData =
	| { mode: DraggableMode.Add; kind: ComponentKind }
	| { mode: DraggableMode.Move; componentId: string }
	| { mode: DraggableMode.AddWithData; data: Component }

export enum DraggableMode {
	Add = 'add',
	Move = 'move',
	AddWithData = 'add-with-data',
}

export enum DraggableKinds {
	Component = 'component',
}

interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
	data: DraggableData
}

export function Draggable({ data, ...rest }: DraggableProps) {
	const [, drag] = useDrag(() => ({ type: DraggableKinds.Component, item: data }))

	return <div ref={drag} {...rest} />
}
