import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	pointerWithin,
	TouchSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { ReactNode } from 'react'
import { uuid } from '../utils'
import { Component, ComponentKind, useCanvasStore } from './canvas-store'
import { DraggableData, DraggableMode } from './draggable'
import { DroppableData, DroppableMode } from './droppable'
import { useSelectionStore } from './selection-store'

export function CanvasWrapper({ children }: { children: ReactNode }) {
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor)
	)
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

	const handleDragEnd = (event: DragEndEvent) => {
		if (!event.over) return
		const activeData = event.active.data.current as DraggableData
		const overData = event.over.data.current as DroppableData
		const overId = overData.componentId
		if (event.over && overId && !overId.includes(event.active.id as string)) {
			const newComponentId = uuid()
			switch (activeData.mode) {
				case DraggableMode.Add:
					{
						switch (overData.mode) {
							case DroppableMode.InsertIn:
								addComponent(
									getComponentDataToAdd(activeData.kind, newComponentId, overId),
									overId
								)
								break
							case DroppableMode.InsertBefore:
								addComponentBefore(
									getComponentDataToAdd(activeData.kind, newComponentId, overId),
									overId
								)
								break
							case DroppableMode.InsertAfter:
								addComponentAfter(
									getComponentDataToAdd(activeData.kind, newComponentId, overId),
									overId
								)
								break
						}
						selectComponent(newComponentId)
					}
					break
				case DraggableMode.Move:
					switch (overData.mode) {
						case DroppableMode.InsertIn:
							moveComponent(activeData.componentId, overId)
							break
						case DroppableMode.InsertBefore:
							moveComponentBefore(activeData.componentId, overId)
							break
						case DroppableMode.InsertAfter:
							moveComponentAfter(activeData.componentId, overId)
							break
					}
					break
			}
		}
	}

	return (
		<DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
			{children}
		</DndContext>
	)
}

const getComponentDataToAdd = (kind: ComponentKind, id: string, parentId: string): Component => {
	switch (kind) {
		case ComponentKind.Box:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: { desktop: { backgroundColor: '#999999' }, tablet: {}, mobile: {} },
				},
			}
		case ComponentKind.Button:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							width: '100%',
							borderRadius: '4px',
							backgroundColor: '#2563eb',
							padding: '4px',
							color: '#ffffff',
							fontWeight: '500',
						},
						tablet: {},
						mobile: {},
					},
					text: 'Button',
				},
			}
		case ComponentKind.Columns:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: { gap: '40px', flex: '1 1 0px', display: 'flex', padding: '40px' },
						tablet: {},
						mobile: {},
					},
				},
			}
		case ComponentKind.Image:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: { backgroundSize: 'cover', backgroundPosition: 'center' },
						tablet: {},
						mobile: {},
					},
					image: null,
					altText: '',
				},
			}
		case ComponentKind.Input:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							border: '1px solid #cccccc',
							borderRadius: '4px',
							width: '100%',
							padding: '4px',
						},
						tablet: {},
						mobile: {},
					},
					defaultValue: '',
					name: '',
					placeholder: '',
					required: false,
					type: 'text',
					value: '',
				},
			}
		case ComponentKind.Select:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							border: '1px solid #cccccc',
							borderRadius: '4px',
							width: '100%',
							padding: '4px',
						},
						tablet: {},
						mobile: {},
					},
					options: [],
					defaultValue: '',
					name: '',
					required: false,
					value: '',
				},
			}
		case ComponentKind.SubmitButton:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							width: '100%',
							borderRadius: '4px',
							backgroundColor: '#2563eb',
							padding: '4px',
							color: '#ffffff',
							fontWeight: '500',
						},
						tablet: {},
						mobile: {},
					},
					text: 'Submit Button',
				},
			}
		case ComponentKind.Text:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: { style: { desktop: {}, tablet: {}, mobile: {} }, text: 'Text' },
			}
		case ComponentKind.Textarea:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: {
						desktop: {
							border: '1px solid #cccccc',
							borderRadius: '4px',
							width: '100%',
							padding: '4px',
						},
						tablet: {},
						mobile: {},
					},
					placeholder: '',
					value: '',
					defaultValue: '',
					required: false,
					name: '',
				},
			}
		case ComponentKind.Form:
			return {
				kind,
				components: [],
				repeatFrom: { name: '', iterator: '' },
				bindings: [],
				events: [],
				id,
				parentId,
				data: {
					style: { desktop: { padding: '40px' }, tablet: {}, mobile: {} },
					dataSourceName: '',
				},
			}
	}
}
