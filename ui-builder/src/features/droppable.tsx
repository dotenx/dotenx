import { useSetAtom } from 'jotai'
import _ from 'lodash'
import { CSSProperties, ReactNode } from 'react'
import { useDrop } from 'react-dnd'
import { uuid } from '../utils'
import { Component, useCanvasStore } from './canvas-store'
import { selectedClassAtom } from './class-editor'
import { getDefaultComponentState } from './default-values'
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

export function Droppable({
	children,
	onClick,
	data,
	style,
}: {
	children?: ReactNode
	onClick?: () => void
	data: DroppableData
	style?: CSSProperties
}) {
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

	const [, drop] = useDrop(() => ({
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
									getDefaultComponentState(
										item.kind,
										newComponentId,
										data.componentId
									),
									data.componentId
								)
								break
							case DroppableMode.InsertBefore:
								addComponentBefore(
									getDefaultComponentState(
										item.kind,
										newComponentId,
										data.componentId
									),
									data.componentId
								)
								break
							case DroppableMode.InsertAfter:
								addComponentAfter(
									getDefaultComponentState(
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
		collect: (monitor) => ({ isOver: monitor.isOver() }),
	}))

	return (
		<div ref={drop} style={style} onClick={onClick}>
			{children}
		</div>
	)
}

const regenComponent = (component: Component, parentId: string) => {
	const newComponent = _.cloneDeep(component)
	newComponent.id = uuid()
	newComponent.parentId = parentId
	newComponent.components = newComponent.components.map((c) => regenComponent(c, newComponent.id))
	return newComponent
}
