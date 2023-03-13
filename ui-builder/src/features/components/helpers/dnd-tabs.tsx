import { DragEndEvent } from '@dnd-kit/core'
import _ from 'lodash'
import { ReactNode, useMemo } from 'react'
import { Element } from '../../elements/element'
import { useSetWithElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { ColumnsElement } from '../../elements/extensions/columns'
import { NavMenuElement } from '../../elements/extensions/nav/nav-menu'
import { DraggableTabs } from './draggable-tabs'

export function DndTabs({
	containerElement,
	renderItemOptions,
	insertElement,
	autoAdjustGridTemplateColumns = true,
	rightSection,
}: {
	containerElement: BoxElement | NavMenuElement | ColumnsElement
	renderItemOptions: (item: Element, index: number) => ReactNode
	insertElement: () => Element
	autoAdjustGridTemplateColumns?: boolean
	rightSection?: ReactNode
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
				content: renderItemOptions(item, index),
				onTabDelete: () =>
					set((draft) => {
						draft.children.splice(index, 1)
						if (!autoAdjustGridTemplateColumns) return
						// remove one 1fr from the grid template columns in all the modes if the number of columns is more than the number of 1frs
						const modes: Array<'desktop' | 'tablet' | 'mobile'> = [
							'desktop',
							'tablet',
							'mobile',
						]
						modes.forEach((mode) => {
							if (draft.style[mode]?.default?.gridTemplateColumns) {
								const columns = (
									draft.style[mode]!.default!.gridTemplateColumns as string
								).split(' ')
								if (columns.length <= draft.children.length) return
								columns.pop()
								draft.style[mode]!.default!.gridTemplateColumns = columns.join(' ')
							}
						})
					}),
			})),
		[listElements, renderItemOptions, set]
	)

	return (
		<DraggableTabs
			tabs={tabs}
			onDragEnd={onDragEnd}
			onAddNewTab={onAddNewTab}
			rightSection={rightSection}
		/>
	)
}

function swap<T>(arr: T[], aIndex: number, bIndex: number) {
	const arrCloned = _.cloneDeep(arr)
	const temp = arrCloned[aIndex]
	arrCloned[aIndex] = arrCloned[bIndex]
	arrCloned[bIndex] = temp
	return arrCloned
}
