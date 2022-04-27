import { useMutation, useQueryClient } from 'react-query'
import { createTrigger, QueryKey, TriggerData } from '../../api'
import { useModal } from '../hooks'

export function useCreateTrigger() {
	const mutation = useMutation(createTrigger)
	const client = useQueryClient()
	const modal = useModal()

	const onSave = (values: TriggerData) => {
		mutation.mutate([values], {
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetTriggers)
				modal.close()
			},
		})
	}

	return {
		onSave,
	}
}
