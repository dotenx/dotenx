import { HotkeyItem } from '@mantine/hooks'
import { useCopyPaste } from '../clipboard/copy-paste'
import { useElementsStore } from '../elements/elements-store'
import { useSelectionStore } from '../selection/selection-store'

export const useCanvasHotkeys = (): HotkeyItem[] => {
	const { elements, removeElement, undo, redo } = useElementsStore((store) => ({
		elements: store.elements,
		removeElement: store.remove,
		undo: store.undo,
		redo: store.redo,
	}))
	const { selectedIds, select, deselect } = useSelectionStore((store) => ({
		selectedIds: store.selectedIds,
		select: store.select,
		deselect: store.deselect,
	}))
	const { copy, paste } = useCopyPaste()
	const remove = () => removeElement(selectedIds)
	const selectAll = () => select(elements.map((element) => element.id))

	return [
		['Escape', deselect],
		['mod+z', undo],
		['mod+shift+z', redo],
		['Delete', remove],
		['Backspace', remove],
		['mod+a', selectAll],
		['mod+c', copy],
		['mod+v', paste],
	]
}
