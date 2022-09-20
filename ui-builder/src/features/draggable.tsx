import { atom, useSetAtom } from 'jotai'
import { forwardRef, useCallback, useEffect } from 'react'
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

export const isDraggingAtom = atom({ isDragging: false })

interface DraggableProps extends React.HTMLAttributes<HTMLDivElement> {
	data: DraggableData
}

export const Draggable = forwardRef<HTMLDivElement, DraggableProps>(({ data, ...rest }, ref) => {
	const [{ isDragging }, drag] = useDrag(() => ({
		type: DraggableKinds.Component,
		item: data,
		collect: (monitor) => ({ isDragging: monitor.isDragging() }),
	}))
	const setDragging = useSetAtom(isDraggingAtom)

	useEffect(() => {
		setDragging({ isDragging })
	}, [isDragging, setDragging])

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
