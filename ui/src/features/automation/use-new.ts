import { useAtom } from "jotai"
import { useNavigate } from "react-router-dom"
import { selectedAutomationAtom, selectedAutomationDataAtom } from "../atoms"
import { useFlowStore } from "../flow/flow-store"

export function useNewAutomation(where: string) {
	const setSelected = useAtom(selectedAutomationDataAtom)[1]
	const setSelectedAutomation = useAtom(selectedAutomationAtom)[1]
	const reset = useFlowStore((store) => store.reset)
	const navigate = useNavigate()

	function newAutomation() {
		setSelectedAutomation(undefined)
		reset()
		setSelected(undefined)
		navigate(where)
	}

	return newAutomation
}
