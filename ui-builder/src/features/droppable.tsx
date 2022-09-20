import { useSetAtom } from 'jotai'
import _ from 'lodash'
import { CSSProperties, forwardRef, ReactNode } from 'react'
import { useDrop } from 'react-dnd'
import { uuid } from '../utils'
import { Component, useCanvasStore } from './canvas-store'
import { selectedClassAtom } from './class-editor'
import { getDefaultComponent } from './default-values'
import { DraggableData, DraggableKinds, DraggableMode } from './draggable'
import { useSelectionStore } from './selection-store'

export interface DroppableData {
	mode: DroppableMode
	componentId: string
}

export enum DroppableMode {
	InsertIn = 'insert-in',
	InsertBefore = 'insert-before',
	InsertAfter = 'insert-after',
}

export const Droppable = forwardRef<
	HTMLDivElement,
	{
		children?: ReactNode
		onClick?: () => void
		data: DroppableData
		style?: CSSProperties
	}
>(({ children, onClick, data, style }, ref) => {
	const {
		addComponent,
		moveComponent,
		addComponentBefore,
		addComponentAfter,
		moveComponentBefore,
		moveComponentAfter,
	} = useCanvasStore((store) => ({
		addComponent: store.addComponent,
		moveComponent: store.moveComponent,
		addComponentBefore: store.addComponentBefore,
		addComponentAfter: store.addComponentAfter,
		moveComponentBefore: store.moveComponentBefore,
		moveComponentAfter: store.moveComponentAfter,
	}))
	const selectComponent = useSelectionStore((store) => store.select)
	const setSelectedClass = useSetAtom(selectedClassAtom)

	const [{ isOver }, drop] = useDrop(() => ({
		accept: DraggableKinds.Component,
		drop: (item: DraggableData, monitor) => {
			if (!monitor.isOver({ shallow: true })) return
			const newComponentId = uuid()
			switch (item.mode) {
				case DraggableMode.Add:
					{
						switch (data.mode) {
							case DroppableMode.InsertIn:
								addComponent(
									getDefaultComponent(
										item.kind,
										newComponentId,
										data.componentId
									),
									data.componentId
								)
								break
							case DroppableMode.InsertBefore:
								addComponentBefore(
									getDefaultComponent(
										item.kind,
										newComponentId,
										data.componentId
									),
									data.componentId
								)
								break
							case DroppableMode.InsertAfter:
								addComponentAfter(
									getDefaultComponent(
										item.kind,
										newComponentId,
										data.componentId
									),
									data.componentId
								)
								break
						}
						selectComponent(newComponentId)
						setSelectedClass(null)
					}
					break
				case DraggableMode.Move:
					if (item.componentId === data.componentId) return
					switch (data.mode) {
						case DroppableMode.InsertIn:
							moveComponent(item.componentId, data.componentId)
							break
						case DroppableMode.InsertBefore:
							moveComponentBefore(item.componentId, data.componentId)
							break
						case DroppableMode.InsertAfter:
							moveComponentAfter(item.componentId, data.componentId)
							break
					}
					break
				case DraggableMode.AddWithData:
					{
						const component = regenComponent(item.data, data.componentId)
						switch (data.mode) {
							case DroppableMode.InsertIn:
								addComponent(component, data.componentId)
								break
							case DroppableMode.InsertBefore:
								addComponentBefore(component, data.componentId)
								break
							case DroppableMode.InsertAfter:
								addComponentAfter(component, data.componentId)
								break
						}
						selectComponent(component.id)
						setSelectedClass(null)
					}
					break
			}
		},
		collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
	}))

	const handleRef = (element: HTMLDivElement) => {
		drop(element)
		if (ref) {
			if (typeof ref === 'function') {
				ref(element)
			} else {
				ref.current = element
			}
		}
	}

	return (
		<div
			ref={handleRef}
			style={{ ...style, backgroundColor: isOver ? '#ffe4e699' : style?.backgroundColor }}
			onClick={onClick}
		>
			{children}
		</div>
	)
})

Droppable.displayName = 'Droppable'

export const regenComponent = (component: Component, parentId: string) => {
	const newComponent = _.cloneDeep(component)
	newComponent.id = uuid()
	newComponent.parentId = parentId
	newComponent.components = newComponent.components.map((c) => regenComponent(c, newComponent.id))
	return newComponent
}
