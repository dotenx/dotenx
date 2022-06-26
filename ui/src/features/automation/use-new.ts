import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import {
	flowAtom,
	initialElements,
	selectedAutomationAtom,
	selectedAutomationDataAtom,
} from '../atoms'

export function useNewAutomation(where: string) {
	const setSelected = useAtom(selectedAutomationDataAtom)[1]
	const setSelectedAutomation = useAtom(selectedAutomationAtom)[1]
	const setElements = useAtom(flowAtom)[1]
	const navigate = useNavigate()

	function newAutomation() {
		setSelectedAutomation(undefined)
		setElements(initialElements)
		setSelected(undefined)
		navigate(where)
	}

	return newAutomation
}
