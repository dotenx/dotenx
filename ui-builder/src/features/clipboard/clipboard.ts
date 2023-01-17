import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Element } from '../elements/element'

interface ClipboardState {
	copiedItems: Element[]
	copy: (items: Element[]) => void
}

export const useClipboardStore = create<ClipboardState>()(
	immer((set) => ({
		copiedItems: [],
		copy: (elements) => {
			set((state) => {
				state.copiedItems = elements
			})
		},
	}))
)
