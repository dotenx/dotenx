import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { deleteAutomation, QueryKey, startAutomation } from '../../api'
import {
	flowAtom,
	listenAtom,
	selectedAutomationAtom,
	selectedAutomationDataAtom,
	selectedExecutionAtom,
} from '../atoms'
import { useClearStatus, useLayout } from '../flow'
import { useModal } from '../hooks'
import { useNewAutomation } from './use-new'

export function useActionBar(deselectAutomation: () => void) {
	const navigate = useNavigate()
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
	const newAutomation = useNewAutomation()

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

	const onDelete = () => {
		if (!selectedAutomationData) return
		deleteAutomationMutation.mutate(selectedAutomationData.name, {
			onSuccess: () => {
				newAutomation()
				client.invalidateQueries(QueryKey.GetAutomations)
			},
		})
	}

	return {
		selectedAutomation,
		onDelete,
		deleteAutomationMutation,
		onRun,
		newAutomation,
		onLayout,
		modal,
	}
}
