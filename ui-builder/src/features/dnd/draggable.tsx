import { atom, useSetAtom } from 'jotai'
import { forwardRef, HTMLAttributes, useCallback, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { ELEMENTS } from '../elements'
import { Element } from '../elements/element'

export type DraggableData =
	| { mode: DraggableMode.Add; ElementClass: (typeof ELEMENTS)[number] }
	| { mode: DraggableMode.Move; elementId: string }
	| { mode: DraggableMode.AddWithData; data: Element }

export enum DraggableMode {
	Add = 'add',
	Move = 'move',
	AddWithData = 'add-with-data',
}

export enum DraggableKinds {
	Component = 'component',
}

export const isDraggingAtom = atom({ isDragging: false })

interface DraggableProps extends HTMLAttributes<HTMLDivElement> {
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
		(target: HTMLDivElement) => {
			try {
				drag(target)
				if (ref) {
					if (typeof ref === 'function') ref(target)
					else ref.current = target
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
