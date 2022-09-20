import create from 'zustand'

interface SelectionState {
	selectedIds: string[]
	hoveredId: string | null
	select: (componentIds: string[]) => void
	setHovered: (componentId: string) => void
	deselect: () => void
	unsetHovered: () => void
}

export const useSelectionStore = create<SelectionState>()((set) => ({
	selectedIds: [],
	hoveredId: null,
	select: (componentIds) => {
		set((state) => ({
			...state,
			selectedIds: componentIds,
		}))
	},
	deselect: () => {
		set((state) => ({
			...state,
			selectedIds: [],
		}))
	},
	setHovered: (componentId) => {
		set((state) => ({
			...state,
			hoveredId: componentId,
		}))
	},
	unsetHovered: () => {
		set((state) => ({
			...state,
			hoveredId: null,
		}))
	},
}))
