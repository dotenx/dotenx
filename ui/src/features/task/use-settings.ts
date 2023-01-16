/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { zodResolver } from "@hookform/resolvers/zod"
import { useDidUpdate } from "@mantine/hooks"
import { useAtomValue } from "jotai"
import _ from "lodash"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "react-query"
import { z } from "zod"
import { getTaskFields, getTaskKinds, QueryKey } from "../../api"
import { GroupData } from "../ui"
import { InputOrSelectKind } from "../ui/input-or-select"
import { outputsAtom, PropertyKind } from "./test-step"

const textValue = {
	type: z.literal(InputOrSelectKind.Text),
	data: z.string().or(z.any()),
}
const selectValue = z.object({
	type: z.literal(InputOrSelectKind.Option),
	data: z.string(),
	groupName: z.string(),
})
const inputOrSelectValue = z.object(textValue).or(selectValue)
const fnValue = z.object({ fn: z.string(), args: z.array(inputOrSelectValue) })
const complexValue = inputOrSelectValue
	.or(fnValue)
	.or(z.object({ kind: z.literal("nested"), data: z.string() }))
	.or(z.object({ kind: z.literal("json"), data: z.string() }))
	.or(z.object({ kind: z.literal("json-array"), data: z.string() }))

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	integration: z.string().optional(),
	others: z.record(complexValue.or(z.array(z.any())).optional()).optional(),
	vars: z.any(),
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
		setValue,
		unregister,
	} = useForm<TaskSettingsSchema>({
		resolver: zodResolver(schema),
		defaultValues: _.cloneDeep(defaultValues),
	})
	const taskType = watch("type")
	const taskName = watch("name")
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

	const taskFields = useMemo(
		() => taskFieldsQuery.data?.data?.fields ?? [],
		[taskFieldsQuery.data?.data?.fields]
	)

	const integrationTypes = taskFieldsQuery.data?.data.integration_types
	const selectedTaskType = _.values(tasks)
		.flat()
		.find((task) => task.type === taskType)

	const outputs = useAtomValue(outputsAtom)
	const outputGroups: GroupData[] = _.toPairs(outputs)
		.filter(([stepName]) => stepName !== taskName)
		.map(([stepName, stepOutputs]) => ({
			name: stepName,
			options: stepOutputs
				.filter((property) => property.kind !== PropertyKind.Array)
				.map((output) => ({ name: output.path, value: JSON.stringify(output.value) })),
		}))

	const onSubmit = handleSubmit((values) => {
		onSave({
			...values,
			iconUrl: selectedTaskType?.icon_url,
			color: selectedTaskType?.node_color,
		})
	})

	useDidUpdate(() => {
		if (taskType) unregister(["integration", "others", "vars", "outputs"])
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
		hasDynamicVariables: taskFieldsQuery.data?.data.has_dynamic_variables,
	}
}

export type UseTaskForm = ReturnType<typeof useTaskSettings>
