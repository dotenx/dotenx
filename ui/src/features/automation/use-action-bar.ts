import { useAtom } from 'jotai'
import _ from 'lodash'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import {
	AutomationKind,
	deleteAutomation,
	getInteractionEndpointFields,
	QueryKey,
	startAutomation,
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
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
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const query = useQuery(
		[QueryKey.GetInteractionEndpointFields, selectedAutomationData?.name],
		() =>
			getInteractionEndpointFields({
				interactionName: selectedAutomationData?.name ?? '',
				projectName,
			}),
		{ enabled: !!selectedAutomationData?.name && kind === 'interaction' }
	)

	const runMutation = useMutation(startAutomation)

	const onRun = () => {
		if (selectedAutomationData)
			if (kind === 'automation') {
				runMutation.mutate(
					{ automationName: selectedAutomationData.name, projectName },
					{
						onSuccess: (data) => {
							navigate(
								`/automations/${selectedAutomationData.name}/executions/${data.data.id}`
							)
							client.invalidateQueries(QueryKey.GetExecutions)
							clearStatus()
							setListen((x) => x + 1)
						},
					}
				)
			} else {
				if (_.entries(query.data?.data).length !== 0) modal.open(Modals.InteractionBody)
				else
					runMutation.mutate(
						{ automationName: selectedAutomationData.name, projectName },
						{
							onSuccess: (data) => modal.open(Modals.InteractionResponse, data.data),
						}
					)
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
		deleteAutomationMutation.mutate(
			{ name: selectedAutomationData.name, projectName },
			{
				onSuccess: () => {
					newAutomation()
					client.invalidateQueries(QueryKey.GetAutomations)
					modal.close()
				},
			}
		)
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
