import { useMutation, useQueryClient } from "react-query"
import { toast } from "react-toastify"
import { activateAutomation, deactivateAutomation, QueryKey } from "../../api"

export function useActivateAutomation(
	isActive: boolean,
	automationName: string,
	projectName: string
) {
	const client = useQueryClient()
	const activateMutation = useMutation(activateAutomation, {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetAutomation)
		},
		onError: (e: any) => {
			toast(e.response.data.message, { type: "error", autoClose: 2000 })
		},
	})
	const deactivateMutation = useMutation(deactivateAutomation, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetAutomation),
	})
	const handleActivate = () => {
		if (isActive) deactivateMutation.mutate({ name: automationName, projectName })
		else activateMutation.mutate({ projectName, name: automationName })
	}
	return {
		handleActivate,
		activateIsLoading: activateMutation.isLoading || deactivateMutation.isLoading,
	}
}
