import { atom } from "jotai"
import { Modals } from "../hooks"

export const modalAtom = atom<{ isOpen: boolean; kind: Modals | null; data: unknown | null }>({
	isOpen: false,
	kind: null,
	data: null,
})
