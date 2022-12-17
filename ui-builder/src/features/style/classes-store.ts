import _ from 'lodash'
import { CSSProperties } from 'react'
import create from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { CssSelector, Style } from '../elements/style'
import { ViewportDevice } from '../viewport/viewport-store'

interface ClassesState {
	classes: Record<string, Style>
	add: (className: string) => void
	edit: (
		className: string,
		viewport: ViewportDevice,
		selector: CssSelector,
		value: CSSProperties
	) => void
	set: (classes: Record<string, Style>) => void
	remove: (className: string) => void
}

export const useClassesStore = create<ClassesState>()(
	immer((set) => ({
		classes: {},
		add: (className) => {
			set((state) => {
				state.classes[className] = { desktop: {}, tablet: {}, mobile: {} }
			})
		},
		edit: (className, viewport, selector, value) => {
			set((state) => {
				_.set(state.classes[className], [viewport, selector], value)
			})
		},
		set: (classes) => {
			set((state) => {
				state.classes = classes
			})
		},
		remove: (className) => {
			set((state) => {
				delete state.classes[className]
			})
		},
	}))
)
