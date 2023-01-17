import { useAtom } from "jotai"
import { useMutation, useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { QueryKey, updateAutomation } from "../../api"
import { AUTOMATION_PROJECT_NAME } from "../../pages/automation"
import { flowAtom } from "../atoms"
import { SaveFormSchema } from "./save-form"
import { mapElementsToPayload } from "./use-save"

export function useUpdateAutomation() {
	const client = useQueryClient()
	const updateAutomationMutation = useMutation(updateAutomation)
	const [elements] = useAtom(flowAtom)
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()

	const onUpdate = (values: SaveFormSchema) => {
		const manifest = mapElementsToPayload(elements)
		updateAutomationMutation.mutate(
			{ payload: { name: values.name, manifest }, projectName },
			{
				onSuccess: () => {
					client.invalidateQueries(QueryKey.GetAutomation)
					toast("Automation saved", { type: "success" })
				},
			}
		)
	}

	return {
		onUpdate,
		isUpdating: updateAutomationMutation.isLoading,
	}
}
