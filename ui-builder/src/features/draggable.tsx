import { forwardRef, useCallback } from 'react'
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

export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(({ data, ...rest }, ref) => {
	const [, drag] = useDrag(() => ({ type: DraggableKinds.Component, item: data }))

	const refHandler = useCallback(
		(node: HTMLDivElement) => {
			try {
				drag(node)
				if (ref) {
					if (typeof ref === 'function') {
						ref(node)
					} else {
						ref.current = node
					}
				}
			} catch (error) {
				console.error(error)
			}
		},
		[drag, ref]
	)

	return <div ref={refHandler} {...rest} />
})

Draggable.displayName = 'Draggable'
