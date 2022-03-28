/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as z from 'zod'
import {
	AddTriggerPayload,
	getIntegrationsByType,
	getPipelines,
	getTriggerDefinition,
	getTriggerTypes,
	QueryKey,
} from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { Select } from '../components/select'
import { getDisplayText } from '../utils'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	pipeline_name: z.string().min(1),
	integration: z.string().min(1),
})

type Schema = z.infer<typeof schema>

interface TriggerFormProps {
	onSave: (values: AddTriggerPayload) => void
	defaultValues?: AddTriggerPayload
	mode: 'new' | 'settings'
}

export function TriggerForm({
	onSave,
	defaultValues = { type: '', name: '', integration: '', pipeline_name: '', credentials: {} },
	mode,
}: TriggerFormProps) {
	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		getValues,
	} = useForm<Schema>({
		defaultValues: defaultValues,
		resolver: zodResolver(schema),
	})
	const triggerType = watch('type')
	const triggerTypesQuery = useQuery(QueryKey.GetTriggerTypes, getTriggerTypes)
	const pipelinesQuery = useQuery(QueryKey.GetPipelines, getPipelines)
	const triggerDefinitionQuery = useQuery(
		[QueryKey.GetTriggerDefinition, triggerType],
		() => getTriggerDefinition(triggerType),
		{ enabled: !!triggerType }
	)
	const integrationType = triggerDefinitionQuery.data?.data.integration
	const integrationQuery = useQuery(
		[QueryKey.GetIntegrationsByType, integrationType],
		() => {
			if (integrationType) return getIntegrationsByType(integrationType)
		},
		{ enabled: !!integrationType }
	)

	return (
		<Form
			css={{ height: '100%' }}
			onSubmit={handleSubmit(() => onSave(getValues() as AddTriggerPayload))}
		>
			<h2>{mode === 'new' ? 'Add trigger' : 'Trigger settings'}</h2>
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
				{mode === 'new' && (
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
				)}
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
			<Button type="submit">{mode === 'new' ? 'Add' : 'Save'}</Button>
		</Form>
	)
}
