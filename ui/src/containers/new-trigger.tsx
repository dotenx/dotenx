/** @jsxImportSource @emotion/react */
import { useMutation, useQueryClient } from 'react-query'
import { createTrigger, CreateTriggerRequest, QueryKey } from '../api'
import { useModal } from '../features/hooks/use-modal'
import { TriggerForm } from './trigger-form'

export function NewTrigger() {
	const mutation = useMutation(createTrigger)
	const client = useQueryClient()
	const modal = useModal()

	const onSave = (values: CreateTriggerRequest) => {
		mutation.mutate(values, {
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetTriggers)
				modal.close()
			},
		})
	}

	return <TriggerForm onSave={onSave} mode="new" />
}
