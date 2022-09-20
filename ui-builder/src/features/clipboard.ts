import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Component } from './canvas-store'

interface ClipboardState {
	copiedComponents: Component[]
	copy: (components: Component[]) => void
}

export const useClipboardStore = create<ClipboardState>()(
	immer((set) => ({
		copiedComponents: [],
		copy: (components) => {
			set((state) => {
				state.copiedComponents = components
			})
		},
	}))
)
