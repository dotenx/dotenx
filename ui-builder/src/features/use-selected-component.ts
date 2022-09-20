import { findComponents, useCanvasStore } from './canvas-store'
import { useSelectionStore } from './selection-store'

export const useSelectedComponent = () => {
	const components = useCanvasStore((store) => store.components)
	const selectedComponentIds = useSelectionStore((store) => store.selectedIds)
	const selectedComponent = findComponents(selectedComponentIds, components)
	return selectedComponent
}
