import { useMutation, useQueryClient } from 'react-query'
import { addTrigger, AddTriggerPayload, QueryKey } from '../api'
import { useModal } from '../hooks/use-modal'
import { TriggerForm } from './trigger-form'

export function NewTrigger() {
	const mutation = useMutation(addTrigger)
	const client = useQueryClient()
	const modal = useModal()

	const onSave = (values: AddTriggerPayload) => {
		mutation.mutate(values, {
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetTriggers)
				modal.close()
			},
		})
	}

	return <TriggerForm onSave={onSave} mode="new" />
}
