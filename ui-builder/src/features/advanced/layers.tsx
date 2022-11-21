import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	useDraggable,
	useDroppable,
} from '@dnd-kit/core'
import { restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { ActionIcon, clsx, Portal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { openModal } from '@mantine/modals'
import { useAtom, useSetAtom } from 'jotai'
import { useState } from 'react'
import { TbChevronDown, TbChevronUp, TbGripVertical, TbPackgeExport } from 'react-icons/tb'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { selectedClassAtom } from '../style/class-editor'
import { ComponentForm } from './component-form'
import { hoveringAtom } from './overlay'

export function DndLayers() {
	const { elements, move } = useElementsStore((store) => ({
		elements: store.elements,
		move: store.move,
	}))
	const [draggedElement, setDraggedElement] = useState<Element | null>(null)

	if (elements.length === 0)
		return <p className="text-xs text-center">Add an element to see layers</p>

	const handleDragStart = (event: DragStartEvent) => {
		setDraggedElement(event.active.data.current as Element)
	}

	const handleDragEnd = (event: DragEndEvent) => {
		const droppedOverElement = event.over?.data.current as Element | undefined
		if (droppedOverElement && draggedElement) {
			move(draggedElement.id, {
				id: droppedOverElement.id,
				mode: droppedOverElement.isContainer() ? 'in' : 'after',
			})
		}
		setDraggedElement(null)
	}

	return (
		<DndContext
			modifiers={[restrictToFirstScrollableAncestor]}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<Layers elements={elements} isParentDragging={false} />
			<Portal>
				<DragOverlay>
					{draggedElement && <LayerOverlay element={draggedElement} />}
				</DragOverlay>
			</Portal>
		</DndContext>
	)
}

function LayerOverlay({ element }: { element: Element }) {
	return (
		<div className="rounded pl-[26px] pr-1.5 py-1 bg-gray-50 flex gap-2 shadow-sm items-center text-sm">
			<div>{element.icon}</div>
			<div>{element.name}</div>

			<div className="cursor-grab hover:bg-gray-50 p-1 rounded ml-auto">
				<TbGripVertical />
			</div>
		</div>
	)
}

function Layers({
	elements,
	isParentDragging,
}: {
	elements: Element[]
	isParentDragging: boolean
}) {
	return (
		<div className="text-sm">
			{elements.map((component) => (
				<Layer key={component.id} element={component} isParentDragging={isParentDragging} />
			))}
		</div>
	)
}

function Layer({
	element: element,
	isParentDragging,
}: {
	element: Element
	isParentDragging: boolean
}) {
	const [hovering, setHovering] = useAtom(hoveringAtom)
	const { select, selectedIds } = useSelectionStore((store) => ({
		select: store.select,
		selectedIds: store.selectedIds,
	}))
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const [opened, disclosure] = useDisclosure(true)
	const { isSelected } = useIsHighlighted(element.id)
	const { isDragging, attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `draggable-${element.id}`,
		data: element,
	})
	const disableDrop = isDragging || isParentDragging
	const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
		id: `droppable-${element.id}`,
		disabled: disableDrop,
		data: element,
	})
	const style = transform
		? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
		: undefined

	const disclosureButton = element.isContainer() && (
		<ActionIcon
			size="xs"
			className="opacity-0 group-hover:opacity-100"
			onClick={(event: any) => {
				event.stopPropagation()
				disclosure.toggle()
			}}
		>
			{opened ? <TbChevronUp /> : <TbChevronDown />}
		</ActionIcon>
	)

	const childrenLayers = element.children && (
		<div className="pl-4" hidden={!opened}>
			<Layers elements={element.children} isParentDragging={isDragging || isParentDragging} />
		</div>
	)

	const setNodeRefs = (element: HTMLElement | null) => {
		setNodeRef(element)
		setDroppableNodeRef(element)
	}
	const isHovered = hovering.elementId === element.id

	return (
		<div
			ref={setNodeRefs}
			style={style}
			{...attributes}
			id={element.id}
			className={clsx(
				'px-1 focus:outline-none',
				isHovered && 'bg-gray-50',
				isSelected && 'bg-gray-200 rounded-sm',
				isDragging && 'opacity-0',
				isOver && !disableDrop && 'bg-green-50'
			)}
			onMouseOver={(event) => {
				event.stopPropagation()
				setHovering({ elementId: element.id })
			}}
			onMouseOut={(event) => {
				event.stopPropagation()
				setHovering({ elementId: null })
			}}
		>
			<div
				className="flex items-center py-1 border-b group"
				onClick={(event) => {
					if (event.ctrlKey && !isSelected) select([...selectedIds, element.id])
					else select([element.id])
					if (!isSelected) setSelectedClass(null)
					window.frames[0].document
						.getElementById(element.id)
						?.scrollIntoView({ behavior: 'smooth' })
				}}
			>
				{element.hasChildren() && <div>{disclosureButton}</div>}
				<span className={clsx('pl-1', !element.hasChildren() && 'pl-[22px]')}>
					{element.icon}
				</span>
				<p className="pl-2 cursor-default">{element.name}</p>
				<div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-1 items-center">
					<ExtractButton element={element} />
					<div
						{...listeners}
						onClick={(event) => event.stopPropagation()}
						className={clsx(
							'cursor-grab hover:bg-gray-50 p-1 rounded',
							isDragging && 'cursor-grabbing'
						)}
					>
						<TbGripVertical />
					</div>
				</div>
			</div>
			{childrenLayers}
		</div>
	)
}

function ExtractButton({ element }: { element: Element }) {
	return (
		<ActionIcon
			title="Create custom component"
			size="sm"
			onClick={() =>
				openModal({
					title: 'Create Component',
					children: <ComponentForm element={element} />,
				})
			}
		>
			<TbPackgeExport />
		</ActionIcon>
	)
}
