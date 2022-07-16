/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import _ from 'lodash'
import { useEffect } from 'react'
import { isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useQueries, useQuery } from 'react-query'
import { z } from 'zod'
import { getTaskFields, getTaskKinds, getTriggerDefinition, QueryKey, TriggerData } from '../../api'
import { flowAtom } from '../atoms'
import { TaskNodeData } from '../flow'
import { NodeType } from '../flow/types'
import { GroupData } from '../ui'
import { InputOrSelectKind } from '../ui/input-or-select'

const textValue = { type: z.literal(InputOrSelectKind.Text), data: z.string() }
const selectValue = z.object({
	type: z.literal(InputOrSelectKind.Option),
	data: z.string(),
	groupName: z.string(),
})
const inputOrSelectValue = z.object(textValue).or(selectValue)
const fnValue = z.object({ fn: z.string(), args: z.array(inputOrSelectValue) })
const complexValue = inputOrSelectValue.or(fnValue)

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	integration: z.string().optional(),
	others: z.record(complexValue).optional(),
	vars: z.array(z.object({ key: z.string(), value: inputOrSelectValue })).optional(),
	outputs: z.array(z.object({ value: z.string() })).optional(),
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
		setValue,
		unregister,
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
			options:
				node.data && 'outputs' in node.data
					? node.data?.outputs?.map((output) => output.value) ?? []
					: [],
			nodeType: node.type as NodeType,
			iconUrl: node.data?.iconUrl,
		}))

	const getTaskFieldsResults = useQueries(
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

	const noneCodeOutputGroups = getTaskFieldsResults
		.map((result) => result.data)
		.filter((r) => !!r) as GroupData[]
	const codeOutputGroups = nodes.filter((node) => node.type?.includes('code'))
	const outputGroups = [...noneCodeOutputGroups, ...codeOutputGroups]

	const onSubmit = handleSubmit(() => {
		onSave({
			...getValues(),
			iconUrl: selectedTaskType?.icon_url,
			color: selectedTaskType?.node_color,
		})
	})

	useEffect(() => {
		if (taskType) unregister(['integration', 'others', 'vars', 'outputs'])
	}, [taskType, unregister])

	return {
		onSubmit,
		control,
		errors,
		tasksOptions,
		taskTypesLoading: tasksQuery.isLoading,
		selectedTaskType,
		taskFields,
		taskFieldsLoading: taskFieldsQuery.isLoading,
		outputGroups,
		integrationTypes,
		setValue,
		taskType,
		selectedTaskIntegrationKind: taskFieldsQuery.data?.data.integration_types[0],
		watch,
	}
}

export type UseTaskForm = ReturnType<typeof useTaskSettings>
