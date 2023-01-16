import { atom } from "jotai"
import { nanoid } from "nanoid"
import { Automation, AutomationData } from "../../api"
import { NodeType } from "../flow/types"
import { Modals } from "../hooks"
import { SlidingPanes } from "../hooks/use-sliding-pane"

export const initialElements = [
	{
		id: nanoid(),
		type: NodeType.Task,
		data: { name: "task", type: "" },
		position: { x: 0, y: 0 },
	},
]

export const listenAtom = atom(0)
export const selectedAutomationDataAtom = atom<Automation | undefined>(undefined)
export const selectedAutomationAtom = atom<AutomationData | undefined>(undefined)
export const flowAtom = atom(initialElements)
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
