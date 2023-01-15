import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface SelectionState {
	selectedIds: string[]
	hoveredId: string | null
	select: (elementsIds: string | string[]) => void
	setHovered: (elementId: string) => void
	deselect: () => void
	unsetHovered: () => void
}

export const useSelectionStore = create<SelectionState>()(
	immer((set) => ({
		selectedIds: [],
		hoveredId: null,
		select: (elementsIds) => {
			set((state) => {
				const ids = [elementsIds].flat()
				state.selectedIds = ids
			})
		},
		deselect: () => {
			set((state) => {
				state.selectedIds = []
			})
		},
		setHovered: (elementId) => {
			set((state) => {
				state.hoveredId = elementId
			})
		},
		unsetHovered: () => {
			set((state) => {
				state.hoveredId = null
			})
		},
	}))
)

export const useIsHighlighted = (elementId: string) => {
	const { selectedComponentIds, hoveredId } = useSelectionStore((store) => ({
		selectedComponentIds: store.selectedIds,
		hoveredId: store.hoveredId,
	}))
	const isHovered = hoveredId === elementId
	const isSelected = selectedComponentIds.includes(elementId)
	const isHighlighted = isSelected || isHovered
	return { isHighlighted, isHovered, isSelected }
}
