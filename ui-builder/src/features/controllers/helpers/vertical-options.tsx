import { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { ActionIcon } from '@mantine/core'
import produce from 'immer'
import { useCallback, useMemo } from 'react'
import { TbX } from 'react-icons/tb'
import { BoxElement } from '../../elements/extensions/box'
import { SortableItem, VerticalSortable } from '../vertical-sortable'

type VerticalOptionsProps = {
	set: (element: BoxElement) => void
	containerDiv: BoxElement
	wrapperDivClassNames?: string
	items: { id: string; content: JSX.Element }[]
	showDelete?: boolean
}

// todo: add offset
export default function VerticalOptions({
	set,
	containerDiv,
	items,
	showDelete = false,
	wrapperDivClassNames = 'flex flex-col justify-center gap-y-1 h-full w-full gap-x-1 items-stretch pr-1 py-2',
}: VerticalOptionsProps): JSX.Element {
	const itemIds = useMemo(() => items.map((item) => item.id), [items])

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event

		if (active.id !== over?.id) {
			const oldIndex = itemIds.indexOf(active?.id as string)
			const newIndex = itemIds.indexOf(over?.id as string)
			set(
				produce(containerDiv, (draft) => {
					draft.children = arrayMove(draft.children, oldIndex, newIndex)
				})
			)
		}
	}

	return (
		<VerticalSortable items={items} onDragEnd={handleDragEnd}>
			<div className={wrapperDivClassNames}>
				{items.map((item, index) => {
					if (showDelete) {
						return (
							<SortableItem key={item.id} id={item.id}>
								<div
									key={item.id}
									className="flex flex-col justify-center gap-y-1 h-full w-full gap-x-1 items-stretch pr-1 py-2"
								>
									<div className="w-full relative h-4">
										<span className="absolute top-0 right-0">
											<ActionIcon
												size="xs"
												onClick={() => {
													set(
														produce(containerDiv, (draft) => {
															draft.children?.splice(index, 1)
														})
													)
												}}
											>
												<TbX />
											</ActionIcon>
										</span>
									</div>
									{item.content}
								</div>
							</SortableItem>
						)
					}
					return (
						<SortableItem key={item.id} id={item.id}>
							{item.content}
						</SortableItem>
					)
				})}
			</div>
		</VerticalSortable>
	)
}
