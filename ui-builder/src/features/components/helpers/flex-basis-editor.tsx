import { useSetElement } from '../../elements/elements-store'
import { BoxElement } from '../../elements/extensions/box'
import { useSelectedElement } from '../../selection/use-selected-component'
import { SliderNoMemo } from '../../simple/stylers/columns-styler'

export function FlexBasisEditor({ listTag }: { listTag: string }) {
	const set = useSetElement()
	const component = useSelectedElement() as BoxElement

	return (
		<SliderNoMemo
			step={1}
			min={1}
			max={3}
			value={component.internal.columns as number}
			onChange={(value) => {
				set(component, (draft) => {
					draft.internal.columns = value
					const list = draft.find(listTag) as BoxElement
					list.children.forEach((child) =>
						child.css({
							flexBasis: `calc(100% / ${value})`,
						})
					)
				})
			}}
		/>
	)
}
