import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { AutomationKind, deleteAutomation, QueryKey, startAutomation } from '../../api'
import { listenAtom, selectedAutomationAtom, selectedAutomationDataAtom } from '../atoms'
import { useClearStatus, useLayout } from '../flow'
import { Modals, useModal } from '../hooks'
import { useNewAutomation } from './use-new'

export function useActionBar(kind: AutomationKind) {
	const { onLayout } = useLayout()
	const [selectedAutomation] = useAtom(selectedAutomationAtom)
	const clearStatus = useClearStatus()
	const client = useQueryClient()
	const setListen = useAtom(listenAtom)[1]
	const [selectedAutomationData] = useAtom(selectedAutomationDataAtom)
	const deleteAutomationMutation = useMutation(deleteAutomation)
	const newAutomation = useNewAutomation('/automations/new')
	const navigate = useNavigate()
	const modal = useModal()

	const runMutation = useMutation(startAutomation, {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetExecutions)
			clearStatus()
			setListen((x) => x + 1)
		},
	})

	const onRun = () => {
		if (selectedAutomationData)
			if (kind !== 'interaction') {
				runMutation.mutate(selectedAutomationData.name, {
					onSuccess: (data) =>
						navigate(
							`/automations/${selectedAutomationData.name}/executions/${data.data.id}`
						),
				})
			} else {
				modal.open(Modals.InteractionBody)
			}
		else {
			console.error('No automation is selected')
		}
	}

	const onDelete = () => {
		modal.open(Modals.DeleteAutomation)
	}

	const handleDeleteAutomation = () => {
		if (!selectedAutomationData) return
		deleteAutomationMutation.mutate(selectedAutomationData.name, {
			onSuccess: () => {
				newAutomation()
				client.invalidateQueries(QueryKey.GetAutomations)
				modal.close()
			},
		})
	}

	return {
		selectedAutomation,
		onDelete,
		onRun,
		newAutomation,
		onLayout,
		handleDeleteAutomation,
		isRunning: runMutation.isLoading,
		runResponse: runMutation.data?.data,
	}
}
