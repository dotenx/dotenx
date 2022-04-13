import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import { z } from 'zod'
import {
	CreateTriggerRequest,
	getAutomations,
	getTriggerDefinition,
	getTriggerKinds,
	QueryKey,
} from '../../api'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	pipeline_name: z.string().min(1),
	integration: z.string().optional(),
})

type Schema = z.infer<typeof schema>

export function useTriggerForm({
	onSave,
	defaultValues,
}: {
	onSave: (values: CreateTriggerRequest) => void
	defaultValues?: CreateTriggerRequest
}) {
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
	const onSubmit = handleSubmit(() =>
		onSave({
			...(getValues() as CreateTriggerRequest),
			iconUrl: selectedTriggerType?.icon_url,
		})
	)
	const pipelineOptions = pipelinesQuery?.data?.data.map((pipeline) => ({
		label: pipeline.name,
		value: pipeline.name,
	}))

	return {
		onSubmit,
		control,
		errors,
		triggerOptions,
		selectedTriggerType,
		pipelinesQuery,
		pipelineOptions,
		integrationTypes,
		triggerDefinitionQuery,
	}
}
