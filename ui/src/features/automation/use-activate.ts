import { useMutation, useQueryClient } from 'react-query'
import { activateAutomation, deactivateAutomation, QueryKey } from '../../api'

export function useActivateAutomation(isActive: boolean, automationName: string) {
	const client = useQueryClient()
	const activateMutation = useMutation(activateAutomation, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetAutomation),
	})
	const deactivateMutation = useMutation(deactivateAutomation, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetAutomation),
	})
	const handleActivate = () => {
		if (isActive) deactivateMutation.mutate(automationName)
		else activateMutation.mutate(automationName)
	}
	return {
		handleActivate,
		activateIsLoading: activateMutation.isLoading || deactivateMutation.isLoading,
	}
}
