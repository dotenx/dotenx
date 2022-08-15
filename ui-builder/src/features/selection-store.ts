import create from 'zustand'

interface SelectionState {
	selectedId: string | null
	hoveredId: string | null
	select: (componentId: string) => void
	setHovered: (componentId: string) => void
	deselect: () => void
	unsetHovered: () => void
}

export const useSelectionStore = create<SelectionState>()((set) => ({
	selectedId: null,
	hoveredId: null,
	select: (componentId) => {
		set((state) => ({
			...state,
			selectedId: componentId,
		}))
	},
	deselect: () => {
		set((state) => ({
			...state,
			selectedId: null,
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
