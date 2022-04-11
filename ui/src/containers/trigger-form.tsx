/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as z from 'zod'
import {
	CreateTriggerRequest,
	getAutomations,
	getTriggerDefinition,
	getTriggerKinds,
	QueryKey,
} from '../api'
import { Button, Field, Form, Select } from '../features/ui'
import { getDisplayText } from '../utils'
import { GroupSelect } from './group-select'
import { SelectIntegration } from './select-integration'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	pipeline_name: z.string().min(1),
	integration: z.string().min(1),
})

type Schema = z.infer<typeof schema>

interface TriggerFormProps {
	onSave: (values: CreateTriggerRequest) => void
	defaultValues?: CreateTriggerRequest
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
	const triggerTypesQuery = useQuery(QueryKey.GetTriggerTypes, getTriggerKinds)
	const pipelinesQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const triggerDefinitionQuery = useQuery(
		[QueryKey.GetTriggerDefinition, triggerType],
		() => getTriggerDefinition(triggerType),
		{ enabled: !!triggerType }
	)
	const integrationTypes = triggerDefinitionQuery.data?.data.integrations
	const triggers = triggerTypesQuery?.data?.data.triggers
	const triggerOptions = _.entries(triggers).map(([group, triggers]) => ({
		group,
		options: triggers.map((trigger) => ({
			label: trigger.type,
			value: trigger.type,
			iconUrl: trigger.icon_url,
		})),
	}))
	const selectedTriggerType = _.values(triggers)
		.flat()
		.find((trigger) => trigger.type === triggerType)

	return (
		<Form
			css={{ height: '100%' }}
			onSubmit={handleSubmit(() =>
				onSave({
					...(getValues() as CreateTriggerRequest),
					iconUrl: selectedTriggerType?.icon_url,
				})
			)}
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
				<div>
					<GroupSelect
						name="type"
						control={control}
						errors={errors}
						options={triggerOptions}
						placeholder="Trigger type"
					/>
					<div css={{ fontSize: 12, marginTop: 6 }}>
						{selectedTriggerType?.description}
					</div>
				</div>
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
				{integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						control={control}
						errors={errors}
						integrationTypes={integrationTypes}
					/>
				)}
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
