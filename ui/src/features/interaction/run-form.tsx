import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import {
	getInteractionEndpointFields,
	QueryKey,
	startAutomation,
	StartAutomationRequest,
} from '../../api'
import { Modals, useModal } from '../hooks'
import { Button, Field, Form, Loader } from '../ui'

export function RunInteractionForm({ interactionName }: { interactionName: string }) {
	const modal = useModal()
	const form = useForm()
	const mutation = useMutation(
		(values: StartAutomationRequest) => startAutomation(interactionName, values),
		{ onSuccess: (data) => modal.open(Modals.InteractionResponse, data.data) }
	)
	const query = useQuery(QueryKey.GetInteractionEndpointFields, () =>
		getInteractionEndpointFields(interactionName)
	)
	const onSubmit = form.handleSubmit((values) => mutation.mutate({ interactionRunTime: values }))
	if (query.isLoading) return <Loader />
	const fields = query.data?.data ?? []

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				{fields.map((field) => (
					<Field
						key={field}
						name={field}
						label={field}
						control={form.control}
						errors={form.formState.errors}
					/>
				))}
			</div>
			<Button loading={mutation.isLoading} type="submit">
				Run
			</Button>
		</Form>
	)
}
