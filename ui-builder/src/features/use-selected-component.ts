import { findComponent, useCanvasStore } from './canvas-store'
import { useSelectionStore } from './selection-store'

export const useSelectedComponent = () => {
	const components = useCanvasStore((store) => store.components)
	const selectedComponentId = useSelectionStore((store) => store.selectedId)
	const selectedComponent = findComponent(selectedComponentId ?? '', components)
	return selectedComponent
}
