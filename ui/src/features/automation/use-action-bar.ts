import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { deleteAutomation, QueryKey, startAutomation } from '../../api'
import { listenAtom, selectedAutomationAtom, selectedAutomationDataAtom } from '../atoms'
import { useClearStatus, useLayout } from '../flow'
import { useNewAutomation } from './use-new'

export function useActionBar() {
	const { onLayout } = useLayout()
	const [selectedAutomation] = useAtom(selectedAutomationAtom)
	const clearStatus = useClearStatus()
	const client = useQueryClient()
	const setListen = useAtom(listenAtom)[1]
	const [selectedAutomationData] = useAtom(selectedAutomationDataAtom)
	const deleteAutomationMutation = useMutation(deleteAutomation)
	const newAutomation = useNewAutomation()

	const mutation = useMutation((endpoint: string) => startAutomation(endpoint), {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetExecutions)
			clearStatus()
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
	}
}
