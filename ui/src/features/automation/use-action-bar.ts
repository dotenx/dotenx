import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { deleteAutomation, QueryKey, startAutomation } from '../../api'
import {
	flowAtom,
	listenAtom,
	selectedAutomationAtom,
	selectedAutomationDataAtom,
	selectedExecutionAtom,
} from '../atoms'
import { initialElements, useClearStatus, useLayout } from '../flow'
import { useModal } from '../hooks'

export function useActionBar(deselectAutomation: () => void) {
	const { onLayout } = useLayout()
	const modal = useModal()
	const [selectedAutomation, setSelectedAutomation] = useAtom(selectedAutomationAtom)
	const clearStatus = useClearStatus()
	const client = useQueryClient()
	const setSelectedExec = useAtom(selectedExecutionAtom)[1]
	const setListen = useAtom(listenAtom)[1]
	const setElements = useAtom(flowAtom)[1]
	const [selectedAutomationData] = useAtom(selectedAutomationDataAtom)
	const deleteAutomationMutation = useMutation(deleteAutomation)

	const mutation = useMutation((endpoint: string) => startAutomation(endpoint), {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetExecutions)
			clearStatus()
			setSelectedExec(undefined)
			setListen((x) => x + 1)
		},
	})

	const onRun = () => {
		if (selectedAutomation) mutation.mutate(selectedAutomation.endpoint)
	}

	function resetAutomation() {
		setSelectedAutomation(undefined)
		setElements(initialElements)
		deselectAutomation()
	}

	const onDelete = () => {
		if (!selectedAutomationData) return
		deleteAutomationMutation.mutate(selectedAutomationData.name, {
			onSuccess: () => {
				resetAutomation()
				client.invalidateQueries(QueryKey.GetAutomations)
			},
		})
	}

	return {
		selectedAutomation,
		onDelete,
		deleteAutomationMutation,
		onRun,
		resetAutomation,
		onLayout,
		modal,
	}
}
