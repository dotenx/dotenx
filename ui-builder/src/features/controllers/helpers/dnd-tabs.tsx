import { DragEndEvent } from '@dnd-kit/core'
import _ from 'lodash'
import { Element } from '../../elements/element'
import { useSetWithElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { DraggableTab, DraggableTabs } from './draggable-tabs'

export function DndTabs({
	tabs,
	containerElement,
	insertElement,
}: {
	tabs: DraggableTab[]
	containerElement: BoxElement
	insertElement: () => Element
}) {
	const set = useSetWithElement(containerElement)

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

	return <DraggableTabs tabs={tabs} onDragEnd={onDragEnd} onAddNewTab={onAddNewTab} />
}

function swap<T>(arr: T[], aIndex: number, bIndex: number) {
	const arrCloned = _.cloneDeep(arr)
	const temp = arrCloned[aIndex]
	arrCloned[aIndex] = arrCloned[bIndex]
	arrCloned[bIndex] = temp
	return arrCloned
}
