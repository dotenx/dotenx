import { useElementsStore } from '../elements/elements-store'
import { useSelectedElement } from '../selection/use-selected-component'

export function SimpleRightSidebar() {
	const selectedElement = useSelectedElement()
	const editElement = useElementsStore((store) => store.set)

	if (!selectedElement || !selectedElement.controller) return null

	return (
		<div className="text-xs">
			{selectedElement.controller.renderOptions({
				element: selectedElement,
				set: editElement,
			})}
		</div>
	)
}
