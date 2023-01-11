import { DragEndEvent } from '@dnd-kit/core'
import _ from 'lodash'
import { ReactNode, useMemo } from 'react'
import { Element } from '../../elements/element'
import { useSetWithElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { DraggableTabs } from './draggable-tabs'

export function DndTabs({
	containerElement,
	renderItemOptions,
	insertElement,
}: {
	containerElement: BoxElement
	renderItemOptions: (item: Element) => ReactNode
	insertElement: () => Element
}) {
	const set = useSetWithElement(containerElement)
	const listElements = containerElement.children as BoxElement[]

	const onDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		if (active.id !== over?.id) {
			const oldIndex = tabs.findIndex((tab) => tab.id === active?.id)
			const newIndex = tabs.findIndex((tab) => tab.id === over?.id)
			set((draft) => (draft.children = swap(draft.children, oldIndex, newIndex)))
		}
	}

	const onAddNewTab = () => {
		set((draft) => draft.children.push(insertElement()))
	}

	const tabs = useMemo(
		() =>
			listElements.map((item, index) => ({
				id: item.id,
				content: renderItemOptions(item),
				onTabDelete: () => set((draft) => draft.children.splice(index, 1)),
			})),
		[listElements, renderItemOptions, set]
	)

	return <DraggableTabs tabs={tabs} onDragEnd={onDragEnd} onAddNewTab={onAddNewTab} />
}

function swap<T>(arr: T[], aIndex: number, bIndex: number) {
	const arrCloned = _.cloneDeep(arr)
	const temp = arrCloned[aIndex]
	arrCloned[aIndex] = arrCloned[bIndex]
	arrCloned[bIndex] = temp
	return arrCloned
}
