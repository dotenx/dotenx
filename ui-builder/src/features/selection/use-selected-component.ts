import { findElements, useElementsStore } from '../elements/elements-store'
import { useSelectionStore } from './selection-store'

export const useSelectedElements = () => {
	const elements = useElementsStore((store) => store.elements)
	const selectedElementsIds = useSelectionStore((store) => store.selectedIds)
	const selectedElements = findElements(selectedElementsIds, elements)
	return selectedElements
}

export const useSelectedElement = () => {
	const selectedElements = useSelectedElements()
	const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null
	return selectedElement
}
