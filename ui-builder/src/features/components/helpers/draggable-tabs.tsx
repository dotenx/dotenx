import {
	closestCenter,
	DndContext,
	DragEndEvent,
	PointerSensor,
	UniqueIdentifier,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ActionIcon, Tabs, Text, Tooltip } from '@mantine/core'
import { ReactNode, useState } from 'react'
import { TbPlus, TbTrash } from 'react-icons/tb'

export type DraggableTabsProps = {
	onDragEnd: (event: DragEndEvent) => void
	onAddNewTab: () => void
	tabs: DraggableTab[]
	maxLength?: number
	minLength?: number
	rightSection?: ReactNode
	onTabChanged?: (index: string) => void
}

export type DraggableTab = {
	id: UniqueIdentifier
	title?: string
	content: ReactNode
	onTabDelete: () => void
}

/*
Note: this component doesn't manage reordering of tabs, onDragEnd is responsible for that.
*/

export function DraggableTabs({
	onDragEnd,
	tabs,
	onAddNewTab,
	maxLength,
	minLength = 1,
	rightSection,
	onTabChanged,
}: DraggableTabsProps) {
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }))

	const [activeTab, setActiveTab] = useState<string | null>(tabs[0].id as string)

	return (
		<Tabs
			keepMounted={false}
			value={activeTab}
			onTabChange={(value) => {
				setActiveTab(value)
				onTabChanged?.(value as string)
			}}
		>
			<div className="flex w-full">
				<Tabs.List className="basis-full">
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={onDragEnd}
					>
						<SortableContext
							items={tabs.map((tab) => tab.id)}
							strategy={horizontalListSortingStrategy}
						>
							{tabs.map((tab, index) => (
								<SortableItem key={tab.id} id={tab.id as string}>
									<Tabs.Tab
										// todo: show drag handle on hover
										value={tab.id as string}
										pt="xs"
									>
										{tab.title ?? index + 1 + ''}
									</Tabs.Tab>
								</SortableItem>
							))}
						</SortableContext>
					</DndContext>
				</Tabs.List>
				<div className="ml-auto">
					{!rightSection && (
						<Tooltip
							withinPortal
							withArrow
							label={<Text size="xs">Add new block</Text>}
						>
							<ActionIcon
								onClick={onAddNewTab}
								variant="transparent"
								disabled={maxLength !== undefined && tabs.length === maxLength}
							>
								<TbPlus
									size={16}
									className={
										maxLength && tabs.length === maxLength
											? 'text-gray-400'
											: 'text-red-500 rounded-full border-red-500 border'
									}
								/>
							</ActionIcon>
						</Tooltip>
					)}
					{rightSection}
				</div>
			</div>
			{tabs.map((tab) => (
				<Tabs.Panel key={tab.id} value={tab.id as string} pt="xs">
					<div className="relative pt-6">
						{tab.content}
						<div className="absolute top-0 right-0">
							<Tooltip
								withinPortal
								withArrow
								label={<Text size="xs">Delete this block</Text>}
							>
								<ActionIcon
									onClick={() => {
										setActiveTab(tabs[0].id as string)
										tab.onTabDelete()
									}}
									variant="transparent"
									disabled={minLength !== undefined && tabs.length === minLength}
								>
									<TbTrash
										size={16}
										className={
											minLength && tabs.length === minLength
												? 'text-gray'
												: 'text-red-500'
										}
									/>
								</ActionIcon>
							</Tooltip>
						</div>
					</div>
				</Tabs.Panel>
			))}
		</Tabs>
	)
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	return (
		<div ref={setNodeRef} style={style} {...attributes} className="inline" {...listeners}>
			{children}
		</div>
	)
}
