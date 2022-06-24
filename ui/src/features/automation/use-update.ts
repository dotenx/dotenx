import { useAtom } from 'jotai'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'react-toastify'
import { QueryKey, updateAutomation } from '../../api'
import { flowAtom } from '../atoms'
import { SaveFormSchema } from './save-form'
import { mapElementsToPayload } from './use-save'

export function useUpdateAutomation() {
	const client = useQueryClient()
	const updateAutomationMutation = useMutation(updateAutomation)
	const [elements] = useAtom(flowAtom)

	const onUpdate = (values: SaveFormSchema) => {
		const manifest = mapElementsToPayload(elements)
		updateAutomationMutation.mutate(
			{ name: values.name, manifest },
			{
				onSuccess: () => {
					client.invalidateQueries(QueryKey.GetAutomation)
					toast('Automation saved', { type: 'success' })
				},
			}
		)
	}

	return {
		onUpdate,
		isUpdating: updateAutomationMutation.isLoading,
	}
}
