import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { deleteAutomation, QueryKey, startAutomation } from '../../api'
import {
	flowAtom,
	listenAtom,
	selectedExecutionAtom,
	selectedPipelineAtom,
	selectedPipelineDataAtom,
} from '../atoms'
import { initialElements, useClearStatus, useLayout } from '../flow'
import { useModal } from '../hooks'

export function useActionBar(deselectPipeline: () => void) {
	const { onLayout } = useLayout()
	const modal = useModal()
	const [selectedPipeline, setSelectedPipeline] = useAtom(selectedPipelineAtom)
	const clearStatus = useClearStatus()
	const client = useQueryClient()
	const setSelectedExec = useAtom(selectedExecutionAtom)[1]
	const setListen = useAtom(listenAtom)[1]
	const setElements = useAtom(flowAtom)[1]
	const [selectedPipelineData] = useAtom(selectedPipelineDataAtom)
	const deletePipelineMutation = useMutation(deleteAutomation)

	const mutation = useMutation((endpoint: string) => startAutomation(endpoint), {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetExecutions)
			clearStatus()
			setSelectedExec(undefined)
			setListen((x) => x + 1)
		},
	})

	const onRun = () => {
		if (selectedPipeline) mutation.mutate(selectedPipeline.endpoint)
	}

	function resetPipeline() {
		setSelectedPipeline(undefined)
		setElements(initialElements)
		deselectPipeline()
	}

	const onDelete = () => {
		if (!selectedPipelineData) return
		deletePipelineMutation.mutate(selectedPipelineData.name, {
			onSuccess: () => {
				resetPipeline()
				client.invalidateQueries(QueryKey.GetAutomations)
			},
		})
	}

	return {
		selectedPipeline,
		onDelete,
		deletePipelineMutation,
		onRun,
		mutation,
		resetPipeline,
		onLayout,
		modal,
	}
}
