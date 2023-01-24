import { Button } from "@mantine/core"
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
			if (e.response.status === 400) {
				toast(
					<div className="space-y-5 pt-3">
						<div className="text-slate-900">
							You have reached your account’s limitation. Please upgrade your account
							to be able to active automations.
						</div>
						<Button size="xs">
							<a href="https://admin.dotenx.com/plan" rel="noopener noreferrer">
								Upgrade plan
							</a>
						</Button>
					</div>,
					{ closeButton: true, autoClose: false }
				)
			} else {
				toast(e.response.data.message, { type: "error", autoClose: 2000 })
			}
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
