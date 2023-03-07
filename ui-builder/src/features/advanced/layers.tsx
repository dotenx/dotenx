import { ActionIcon, clsx } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { openModal } from '@mantine/modals'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
	TbChevronDown,
	TbChevronUp,
	TbEye,
	TbEyeOff,
	TbGripVertical,
	TbPackageExport,
} from 'react-icons/tb'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { DroppableMode } from '../dnd/droppable'
import { DroppablePortal } from '../dnd/droppable-portal'
import { Element } from '../elements/element'
import { useElementsStore, useSetElement } from '../elements/elements-store'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { selectedClassAtom } from '../style/class-editor'
import { ComponentForm } from './component-form'
import { sidebarAtom } from './element-dragger-layer'
import { hoveringAtom } from './overlay'

export function DndLayers() {
	const elements = useElementsStore((store) => store.elements)

	if (elements.length === 0)
		return <p className="text-xs text-center">Add an element to see layers</p>

	return <Layers elements={elements} isParentDragging={false} />
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
	const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
	const [hovering, setHovering] = useAtom(hoveringAtom)
	const select = useSelectionStore((store) => store.select)
	const selectedIds = useSelectionStore((store) => store.selectedIds)
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const [childrenExpanded, childrenExpandedHandlers] = useDisclosure(true)
	const { isSelected } = useIsHighlighted(element.id)
	const isHovered = hovering.elementId === element.id
	const sidebar = useAtomValue(sidebarAtom)
	const [delayedRender, setDelayedRender] = useState(false)

	const handleSelectLayer = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.ctrlKey && !isSelected) select([...selectedIds, element.id])
		else select([element.id])
		if (!isSelected) setSelectedClass(null)
		window.frames[0].document.getElementById(element.id)?.scrollIntoView({ behavior: 'smooth' })
	}

	const childrenLayers = element.children && (
		<div className="pl-2" hidden={!childrenExpanded}>
			<Layers elements={element.children} isParentDragging={isParentDragging} />
		</div>
	)

	useEffect(() => {
		if (sidebar.tab === 'layers') setDelayedRender(true)
		else setDelayedRender(false)
	}, [sidebar.tab])

	return (
		<div
			id={element.id}
			className={clsx(
				'px-1 focus:outline-none',
				isHovered && 'bg-gray-50',
				isSelected && 'bg-gray-100 rounded-sm'
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
				onClick={handleSelectLayer}
				ref={setReferenceElement}
			>
				{element.hasChildren() && (
					<DisclosureButton
						opened={childrenExpanded}
						onClick={childrenExpandedHandlers.toggle}
					/>
				)}
				<span className={clsx('pl-1', !element.hasChildren() && 'pl-[22px]')}>
					{element.icon}
				</span>
				<p className="pl-2 cursor-default">{element.name}</p>
				<div className="ml-auto flex gap-1 items-center">
					<ToggleVisibilityButton element={element} />
					<ExtractButton element={element} />
					<DragHandle elementId={element.id} />
				</div>
				{element.isContainer() && (
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertIn, elementId: element.id }}
						overStyle={{ boxShadow: 'inset 0px 0px 0px 3px #fb7185' }}
						placement="bottom"
						fullWidth
						fullHeight
						center
						updateDeps={[element, sidebar.tab, delayedRender]}
						targetElement={document.body}
						style={{ zIndex: 100 }}
					/>
				)}
				<DroppablePortal
					referenceElement={referenceElement}
					data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
					style={{ height: '10px', zIndex: 100 }}
					overStyle={{ boxShadow: 'inset 0px 3px 0px 0px #fb7185' }}
					placement="top"
					fullWidth
					halfHeight={!element.isContainer()}
					center={!element.isContainer()}
					updateDeps={[element, element, sidebar.tab, delayedRender]}
					targetElement={document.body}
				/>
				<DroppablePortal
					referenceElement={referenceElement}
					data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
					style={{ height: '10px', zIndex: 100 }}
					overStyle={{ boxShadow: 'inset 0px -3px 0px 0px #fb7185' }}
					placement="bottom"
					fullWidth
					halfHeight={!element.isContainer()}
					center={!element.isContainer()}
					updateDeps={[element, element, sidebar.tab, delayedRender]}
					targetElement={document.body}
				/>
			</div>
			{childrenLayers}
		</div>
	)
}

function DragHandle({ elementId }: { elementId: string }) {
	return (
		<Draggable
			data={{ mode: DraggableMode.Move, elementId }}
			onClick={(event) => event.stopPropagation()}
			className="cursor-grab hover:bg-gray-50 p-1 rounded opacity-0 group-hover:opacity-100"
		>
			<TbGripVertical />
		</Draggable>
	)
}

function ToggleVisibilityButton({ element }: { element: Element }) {
	const set = useSetElement()

	return (
		<ActionIcon
			size="sm"
			className={clsx(!element.hidden && 'opacity-0 group-hover:opacity-100')}
			onClick={(event: any) => {
				event.stopPropagation()
				set(element, (draft) => (draft.hidden = !element.hidden))
			}}
		>
			{element.hidden ? <TbEyeOff /> : <TbEye />}
		</ActionIcon>
	)
}

function DisclosureButton({ onClick, opened }: { onClick: () => void; opened: boolean }) {
	return (
		<ActionIcon
			size="xs"
			className="opacity-0 group-hover:opacity-100"
			onClick={(event: any) => {
				event.stopPropagation()
				onClick()
			}}
		>
			{opened ? <TbChevronUp /> : <TbChevronDown />}
		</ActionIcon>
	)
}

function ExtractButton({ element }: { element: Element }) {
	return (
		<ActionIcon
			title="Create custom component"
			className="opacity-0 group-hover:opacity-100"
			size="sm"
			onClick={() =>
				openModal({
					title: 'Create Component',
					children: <ComponentForm element={element} />,
				})
			}
		>
			<TbPackageExport />
		</ActionIcon>
	)
}
