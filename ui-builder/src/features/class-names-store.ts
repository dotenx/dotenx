import { CSSProperties } from 'react'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Style } from './canvas-store'
import { ViewportDevice } from './viewport-store'

interface ClassNamesState {
	classNames: Record<string, Style>
	add: (className: string) => void
	edit: (className: string, viewport: ViewportDevice, value: CSSProperties) => void
	set: (classNames: Record<string, Style>) => void
	remove: (className: string) => void
}

export const useClassNamesStore = create<ClassNamesState>()(
	immer((set) => ({
		classNames: {},
		add: (className) => {
			set((state) => {
				state.classNames[className] = { desktop: {}, tablet: {}, mobile: {} }
			})
		},
		edit: (className, viewport, value) => {
			set((state) => {
				state.classNames[className][viewport] = value
			})
		},
		set: (classNames) => {
			set((state) => {
				state.classNames = classNames
			})
		},
		remove: (className) => {
			set((state) => {
				delete state.classNames[className]
			})
		},
	}))
)
