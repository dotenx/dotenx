/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import _ from 'lodash'
import { isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useQueries, useQuery } from 'react-query'
import { z } from 'zod'
import { getTaskFields, getTaskKinds, getTriggerDefinition, QueryKey, TriggerData } from '../../api'
import { flowAtom } from '../atoms'
import { NodeType, TaskNodeData } from '../flow'
import { GroupData } from '../ui'
import { InputOrSelectKind } from '../ui/input-or-select'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	integration: z.string().optional(),
	others: z
		.record(
			z.object({ type: z.literal(InputOrSelectKind.Text), data: z.string() }).or(
				z.object({
					type: z.literal(InputOrSelectKind.Option),
					data: z.string(),
					groupName: z.string(),
				})
			)
		)
		.optional(),
})

export type TaskSettingsSchema = z.infer<typeof schema>

export function useTaskSettings({
	defaultValues,
	onSave,
}: {
	defaultValues: TaskSettingsSchema
	onSave: (values: TaskSettingsSchema & { iconUrl?: string; color?: string }) => void
}) {
	const {
		control,
		formState: { errors },
		handleSubmit,
		watch,
		getValues,
	} = useForm<TaskSettingsSchema>({
		resolver: zodResolver(schema),
		defaultValues: _.cloneDeep(defaultValues),
	})
	const taskType = watch('type')
	const taskName = watch('name')
	const tasksQuery = useQuery(QueryKey.GetTasks, getTaskKinds)
	const tasks = tasksQuery.data?.data?.tasks
	const tasksOptions = _.entries(tasks).map(([group, tasks]) => ({
		group,
		options: tasks.map((task) => ({
			label: task.type,
			value: task.type,
			iconUrl: task.icon_url,
		})),
	}))
	const taskFieldsQuery = useQuery(
		[QueryKey.GetTaskFields, taskType],
		() => {
			if (!taskType) return
			return getTaskFields(taskType)
		},
		{
			enabled: !!taskType,
		}
	)
	const taskFields = taskFieldsQuery.data?.data?.fields ?? []
	const integrationTypes = taskFieldsQuery.data?.data.integration_types
	const selectedTaskType = _.values(tasks)
		.flat()
		.find((task) => task.type === taskType)
	const [flowElements] = useAtom(flowAtom)
	const nodes = (flowElements.filter(isNode) as Node<TaskNodeData | TriggerData>[])
		.filter((node) => node.data?.name !== taskName)
		.map((node) => ({
			name: node.data?.name ?? '',
			type: node.data?.type,
			options: [],
			nodeType: node.type as NodeType,
			iconUrl: node.data?.iconUrl,
		}))

	const results = useQueries(
		nodes.map((node) => ({
			queryKey: [QueryKey.GetTaskFields, node.name, node.type],
			queryFn: async () => {
				const response =
					node.nodeType === NodeType.Task
						? getTaskFields(node.type!)
						: getTriggerDefinition(node.type!)
				const outputs = (await response).data.outputs
				return { ...node, options: outputs.map((output) => output.key) }
			},
			enabled: !!node.type,
		}))
	)

	const outputGroups = results.map((result) => result.data).filter((r) => !!r) as GroupData[]

	const onSubmit = handleSubmit(() => {
		onSave({
			...getValues(),
			iconUrl: selectedTaskType?.icon_url,
			color: selectedTaskType?.node_color,
		})
	})

	return {
		onSubmit,
		control,
		errors,
		tasksOptions,
		selectedTaskType,
		taskFields,
		outputGroups,
		integrationTypes,
	}
}
