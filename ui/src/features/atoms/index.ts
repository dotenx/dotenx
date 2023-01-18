import { atom } from "jotai"
import { Automation, AutomationData } from "../../api"
import { Modals } from "../hooks"
import { SlidingPanes } from "../hooks/use-sliding-pane"

export const listenAtom = atom(0)
export const selectedAutomationDataAtom = atom<Automation | undefined>(undefined)
export const selectedAutomationAtom = atom<AutomationData | undefined>(undefined)
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

export const tourElementsLoading = atom({ userManagementLoading: false })
