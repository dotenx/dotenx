import { atom } from "jotai"
import { Modals } from "../hooks"
import { SlidingPanes } from "../hooks/use-sliding-pane"

export const modalAtom = atom<{ isOpen: boolean; kind: Modals | null; data: unknown | null }>({
	isOpen: false,
	kind: null,
	data: null,
})
export const slidingPaneAtom = atom<{
	isOpen: boolean
	kind: SlidingPanes | null
	data: unknown | null
}>({
	isOpen: false,
	kind: null,
	data: null,
})
