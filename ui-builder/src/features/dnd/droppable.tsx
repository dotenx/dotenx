import { CSSProperties, forwardRef, HTMLAttributes } from 'react'
import { useDrop } from 'react-dnd'
import { regenElement } from '../clipboard/copy-paste'
import { useElementsStore } from '../elements/elements-store'
import { useSelectionStore } from '../selection/selection-store'
import { DraggableData, DraggableKinds, DraggableMode } from './draggable'

interface DroppableProps extends HTMLAttributes<HTMLDivElement> {
	data: DroppableData
	overStyle?: CSSProperties
}

export const Droppable = forwardRef<HTMLDivElement, DroppableProps>(
	({ children, data, style, overStyle = {}, ...rest }, ref) => {
		const { add, move } = useElementsStore((store) => ({ add: store.add, move: store.move }))
		const select = useSelectionStore((store) => store.select)

		const [{ isOver }, drop] = useDrop(() => ({
			accept: DraggableKinds.Component,
			drop: (item: DraggableData, monitor) => {
				if (!monitor.isOver({ shallow: true })) return
				switch (item.mode) {
					case DraggableMode.Add:
						{
							const element = new item.ElementClass()
							switch (data.mode) {
								case DroppableMode.InsertIn:
									add(element, { id: data.elementId, mode: 'in' })
									break
								case DroppableMode.InsertBefore:
									add(element, { id: data.elementId, mode: 'before' })
									break
								case DroppableMode.InsertAfter:
									add(element, { id: data.elementId, mode: 'after' })
									break
							}
							select(element.id)
						}
						break
					case DraggableMode.Move:
						if (item.elementId === data.elementId) return
						switch (data.mode) {
							case DroppableMode.InsertIn:
								move(item.elementId, { id: data.elementId, mode: 'in' })
								break
							case DroppableMode.InsertBefore:
								move(item.elementId, { id: data.elementId, mode: 'before' })
								break
							case DroppableMode.InsertAfter:
								move(item.elementId, { id: data.elementId, mode: 'after' })
								break
						}
						break
					case DraggableMode.AddWithData:
						{
							const element = regenElement(item.data)
							switch (data.mode) {
								case DroppableMode.InsertIn:
									add(element, {
										id: data.elementId,
										mode: 'in',
									})
									break
								case DroppableMode.InsertBefore:
									add(element, {
										id: data.elementId,
										mode: 'before',
									})
									break
								case DroppableMode.InsertAfter:
									add(element, {
										id: data.elementId,
										mode: 'after',
									})
									break
							}
							select(element.id)
						}
						break
				}
			},
			collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
		}))
		const handleRef = (element: HTMLDivElement) => {
			drop(element)
			if (ref) {
				if (typeof ref === 'function') ref(element)
				else ref.current = element
			}
		}

		return (
			<div ref={handleRef} style={{ ...style, ...(isOver ? overStyle : {}) }} {...rest}>
				{children}
			</div>
		)
	}
)

Droppable.displayName = 'Droppable'

export interface DroppableData {
	mode: DroppableMode
	elementId: string
}

export enum DroppableMode {
	InsertIn = 'insert-in',
	InsertBefore = 'insert-before',
	InsertAfter = 'insert-after',
}
