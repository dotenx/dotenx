import create from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface ProjectState {
	tag: string
	setTag: (tag: string) => void
}

export const useProjectStore = create<ProjectState>()(
	immer((set) => ({
		tag: '',
		setTag: (tag) => {
			set((state) => {
				state.tag = tag
			})
		},
	}))
)
