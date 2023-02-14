import {
	closestCenter,
	DndContext,
	DragEndEvent,
	PointerSensor,
	UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ReactNode } from 'react'
import { TbGripVertical } from 'react-icons/tb'

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
			className="flex items-center rounded-md shadow-md py-2 px-1 gap-2 bg-gray-50"
		>
			<div>
				<span className="dragHandleClass text-gray-600" {...listeners}>
					<TbGripVertical />
				</span>
			</div>
			<div className="w-full h-full">{children}</div>
		</div>
	)
}
