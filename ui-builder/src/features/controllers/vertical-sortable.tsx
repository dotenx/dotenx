import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	UniqueIdentifier,
} from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ReactNode } from 'react'
import { CSS } from '@dnd-kit/utilities'


export type VerticalSortableProps = {
	onDragEnd: (event: DragEndEvent) => void
	items: (
		| UniqueIdentifier
		| {
				id: UniqueIdentifier
		  }
	)[]
	children: ReactNode[] | ReactNode
}

export function VerticalSortable({ onDragEnd, items, children }: VerticalSortableProps) {
	const sensors = useSensors(useSensor(PointerSensor))

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
			<SortableContext items={items} strategy={verticalListSortingStrategy}>
				{children}
			</SortableContext>
		</DndContext>
	)
}

export function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className="flex items-center	 rounded-md shadow-md py-2 px-1"
		>
			<div>
				<span className="dragHandleClass text-gray-600" {...listeners}>
					<svg viewBox="0 0 20 20" width="12">
						<path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
					</svg>
				</span>
			</div>
			<div className="w-full h-full">{children}</div>
		</div>
	)
}