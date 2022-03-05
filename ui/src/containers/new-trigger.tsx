import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as z from 'zod'
import {
	addTrigger,
	AddTriggerPayload,
	getIntegrations,
	getPipelines,
	getTriggerDefinition,
	getTriggerTypes,
	QueryKey,
} from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { Select } from '../components/select'
import { useModal } from '../hooks/use-modal'
import { getDisplayText } from '../utils'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	pipeline_name: z.string().min(1),
	integration: z.string().min(1),
})

type Schema = z.infer<typeof schema>

export function NewTrigger() {
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		getValues,
	} = useForm<Schema>({
		defaultValues: { type: '', name: '', integration: '', pipeline_name: '' },
		resolver: zodResolver(schema),
	})
	const triggerType = watch('type')
	const triggerTypesQuery = useQuery(QueryKey.GetTriggerTypes, getTriggerTypes)
	const pipelinesQuery = useQuery(QueryKey.GetPipelines, getPipelines)
	const integrationQuery = useQuery(QueryKey.GetIntegrations, getIntegrations)
	const triggerDefinitionQuery = useQuery(
		[QueryKey.GetTriggerDefinition, triggerType],
		() => getTriggerDefinition(triggerType),
		{ enabled: !!triggerType }
	)
	const mutation = useMutation(addTrigger)
	const client = useQueryClient()
	const modal = useModal()

	const onSave = () => {
		const fieldValues = getValues() as AddTriggerPayload
		mutation.mutate(fieldValues, {
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetTriggers)
				modal.close()
			},
		})
	}

	return (
		<Form css={{ height: '100%' }} onSubmit={handleSubmit(onSave)}>
			<h2>New trigger</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field
					label="Name"
					name="name"
					placeholder="Trigger name"
					control={control}
					errors={errors}
				/>
				<Select
					label="Type"
					name="type"
					control={control}
					isLoading={triggerTypesQuery.isLoading}
					errors={errors}
					options={triggerTypesQuery?.data?.data.map((triggerType) => ({
						label: getDisplayText(triggerType),
						value: triggerType,
					}))}
					placeholder="Trigger type"
				/>
				<Select
					label="Pipeline"
					name="pipeline_name"
					control={control}
					isLoading={pipelinesQuery.isLoading}
					errors={errors}
					options={pipelinesQuery?.data?.data.map((pipeline) => ({
						label: pipeline.name,
						value: pipeline.name,
					}))}
					placeholder="Pipeline name"
				/>
				<Select
					label="Integration"
					name="integration"
					control={control}
					isLoading={integrationQuery.isLoading}
					errors={errors}
					options={integrationQuery?.data?.data.map((integration) => ({
						label: integration.name,
						value: integration.name,
					}))}
					placeholder="Integration name"
				/>
				{triggerDefinitionQuery?.data?.data.credentials.map((triggerDefinition) => (
					<Field
						key={triggerDefinition.Key}
						label={getDisplayText(triggerDefinition.Key)}
						name={`credentials.${triggerDefinition.Key}`}
						control={control}
						required
						errors={errors}
					/>
				))}
			</div>
			<Button type="submit">Add</Button>
		</Form>
	)
}
