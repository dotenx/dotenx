import produce, { Draft } from 'immer'
import _ from 'lodash'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Element } from './element'

type ElementPlacement = {
	id: string
	mode: 'before' | 'in' | 'after'
}

interface ElementsState {
	elements: Element[]
	history: Element[][]
	historyIndex: number
	saved: Element[]
	add: (elements: Element | Element[], where: ElementPlacement) => void
	move: (id: string, where: ElementPlacement) => void
	set: (element: Element) => void
	silenceSet: (element: Element) => void
	remove: (ids: string[]) => void
	reset: (elements?: Element[]) => void
	undo: () => void
	redo: () => void
	save: () => void
}

export const useElementsStore = create<ElementsState>()(
	immer((set) => ({
		elements: [],
		history: [],
		historyIndex: -1,
		saved: [],
		add: (elements, where) => {
			set((state) => {
				const elementsToAdd = [elements].flat()
				addElement(elementsToAdd, state.elements, where)
				state.history = [...state.history.slice(0, state.historyIndex + 1), state.elements]
				state.historyIndex = state.historyIndex + 1
			})
		},
		move: (id, where) => {
			set((state) => {
				const element = findElement(id, state.elements)
				if (!element) return
				const newElements = removeElements([id], state.elements)
				addElement([element], newElements, where)
				state.elements = newElements
				state.history = [...state.history.slice(0, state.historyIndex + 1), state.elements]
				state.historyIndex = state.historyIndex + 1
			})
		},
		set: (element) => {
			set((state) => {
				const foundElement = findElement(element.id, state.elements)
				_.assign(foundElement, element)
				state.history = [...state.history.slice(0, state.historyIndex + 1), state.elements]
				state.historyIndex = state.historyIndex + 1
			})
		},
		silenceSet: (element) => {
			set((state) => {
				const foundElement = findElement(element.id, state.elements)
				_.assign(foundElement, element)
			})
		},
		remove: (ids) => {
			set((state) => {
				const elements = findElements(ids, state.elements)
				elements.forEach((element) => element.onDelete())
				state.elements = removeElements(ids, state.elements)
				state.history = [...state.history.slice(0, state.historyIndex + 1), state.elements]
				state.historyIndex = state.historyIndex + 1
			})
		},
		reset: (elements) => {
			set((state) => {
				state.history = []
				state.historyIndex = -1
				state.elements = elements ?? []
				state.saved = elements ?? []
			})
		},
		undo: () => {
			set((state) => {
				if (state.historyIndex < 0) return
				if (state.historyIndex === 0) {
					state.elements = state.saved
					state.historyIndex = -1
				} else {
					state.elements = state.history[state.historyIndex - 1]
					state.historyIndex = state.historyIndex - 1
				}
			})
		},
		redo: () => {
			set((state) => {
				if (state.historyIndex >= state.history.length - 1) return
				state.elements = state.history[state.historyIndex + 1]
				state.historyIndex = state.historyIndex + 1
			})
		},
		save: () => {
			set((state) => {
				state.saved = state.elements
			})
		},
	}))
)

const addElement = (elementsToAdd: Element[], elements: Element[], where: ElementPlacement) => {
	const relativeElement = findElement(where.id, elements)
	const parentElement = findParent(where.id, elements)
	const siblings = parentElement?.children ?? elements
	const relativeElementIndex = relativeElement ? siblings?.indexOf(relativeElement) ?? -1 : -1
	switch (where.mode) {
		case 'before':
			siblings.splice(relativeElementIndex, 0, ...elementsToAdd)
			break
		case 'in':
			if (relativeElement) relativeElement.children?.push(...elementsToAdd)
			else elements.push(...elementsToAdd)
			break
		case 'after':
			siblings.splice(relativeElementIndex + 1, 0, ...elementsToAdd)
			break
	}
}

const removeElements = (ids: string[], elements: Element[]) => {
	const idsToRemove = new Set(ids)
	const newElements = elements.filter((element) => {
		if (idsToRemove.has(element.id)) return false
		if (element.children) element.children = removeElements(ids, element.children)
		return true
	})
	return newElements
}

export const findParent = (id: string, elements: Element[]): Element | null => {
	for (const element of elements) {
		if (element.children) {
			const isParent = element.children.some((child) => child.id === id)
			if (isParent) return element
			const parent = findParent(id, element.children)
			if (parent) return parent
		}
	}
	return null
}

export const findElement = (id: string, elements: Element[]): Element | null => {
	for (const element of elements) {
		if (element.id === id) {
			return element
		} else {
			const foundElement = findElement(id, element.children ?? [])
			if (foundElement) return foundElement
		}
	}
	return null
}

export const findElements = (ids: string[], elements: Element[]): Element[] => {
	const foundElements: Element[] = []
	for (const id of ids) {
		const foundComponent = findElement(id, elements)
		if (foundComponent) foundElements.push(foundComponent)
	}
	return foundElements
}

export function useSetElement() {
	const set = useElementsStore((store) => store.set)
	function setter<T extends Element = Element>(element: T, fn: (draft: Draft<T>) => void) {
		set(
			produce(element, (draft) => {
				fn(draft)
			})
		)
	}
	return setter
}

export function setElement<T extends Element = Element>(element: T, fn: (draft: Draft<T>) => void) {
	const set = useElementsStore.getState().silenceSet
	set(
		produce(element, (draft) => {
			fn(draft)
		})
	)
}

export function useSetWithElement<E extends Element = Element>(targetElement: E) {
	const set = useElementsStore((store) => store.set)
	function setter(fn: (draft: Draft<E>) => void) {
		set(
			produce(targetElement, (draft) => {
				fn(draft)
			})
		)
	}
	return setter
}
