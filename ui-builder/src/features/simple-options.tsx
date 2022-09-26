import { useCanvasStore } from './canvas-store'
import { useSelectedComponent as useSelectedComponents } from './use-selected-component'

export function SimpleOptions() {
	const selectedComponents = useSelectedComponents()
	const editComponent = useCanvasStore((store) => store.edit)
	const selectedComponent = selectedComponents.length === 1 ? selectedComponents[0] : null

	if (!selectedComponent || !selectedComponent.controller) return null

	return (
		<div className="text-xs">
			{selectedComponent.controller.renderOptions({
				component: selectedComponent,
				set: editComponent,
			})}
		</div>
	)
}
