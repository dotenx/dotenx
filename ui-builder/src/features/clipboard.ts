import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Component } from './canvas-store'

interface ClipboardState {
	copiedComponent: Component | null
	copy: (component: Component) => void
}

export const useClipboardStore = create<ClipboardState>()(
	immer((set) => ({
		copiedComponent: null,
		copy: (component) => {
			set((state) => {
				state.copiedComponent = component
			})
		},
	}))
)
