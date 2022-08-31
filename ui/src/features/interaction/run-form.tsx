import { Button } from '@mantine/core'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import {
	getInteractionEndpointFields,
	QueryKey,
	startAutomation,
	StartAutomationRequest,
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { Modals, useModal } from '../hooks'
import { Field, Form, Loader } from '../ui'

export function RunInteractionForm({ interactionName }: { interactionName: string }) {
	const modal = useModal()
	const form = useForm()
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const mutation = useMutation(
		(values: StartAutomationRequest) =>
			startAutomation({ automationName: interactionName, projectName, payload: values }),
		{ onSuccess: (data) => modal.open(Modals.InteractionResponse, data.data) }
	)
	const query = useQuery(
		[QueryKey.GetInteractionEndpointFields, interactionName],
		() => getInteractionEndpointFields({ interactionName, projectName }),
		{ enabled: !!interactionName }
	)
	const onSubmit = form.handleSubmit((values) => mutation.mutate({ interactionRunTime: values }))
	if (query.isLoading) return <Loader />
	const fields = _.toPairs(query.data?.data).flatMap(([taskName, fields]) =>
		fields.map((field) => ({ name: `${taskName}.${field}`, value: field }))
	)

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				{fields.map((field) => (
					<Field
						key={field.name}
						name={field.name}
						label={field.name}
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
