/* eslint-disable @typescript-eslint/no-non-null-assertion */
/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import _ from 'lodash'
import { isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useQueries, useQuery } from 'react-query'
import * as z from 'zod'
import {
	CreateTriggerRequest,
	getTaskFields,
	getTaskKinds,
	getTriggerDefinition,
	QueryKey,
} from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { GroupData, InputOrSelect, InputOrSelectValue } from '../components/input-or-select'
import { NodeType, TaskNodeData } from '../components/task-node'
import { flowAtom } from '../hooks/use-flow'
import { GroupSelect } from './group-select'
import { SelectIntegration } from './select-integration'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
})

type Schema = z.infer<typeof schema>

interface TaskSettingsProps {
	defaultValues: Schema
	onSave: (
		values: Schema & { iconUrl?: string } & Record<
				string,
				string | InputOrSelectValue | undefined
			>
	) => void
}

export function TaskSettings({ defaultValues, onSave }: TaskSettingsProps) {
	const {
		control,
		formState: { errors },
		handleSubmit,
		watch,
		getValues,
	} = useForm<Schema>({
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
	const nodes = (flowElements.filter(isNode) as Node<TaskNodeData | CreateTriggerRequest>[])
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
					node.nodeType === NodeType.Default
						? getTaskFields(node.type!)
						: getTriggerDefinition(node.type!)
				const outputs = (await response).data.outputs
				return { ...node, options: outputs.map((output) => output.Key) }
			},
			enabled: !!node.type,
		}))
	)

	const outputGroups = results.map((result) => result.data).filter((r) => !!r) as GroupData[]

	return (
		<Form
			css={{ height: '100%' }}
			onSubmit={handleSubmit(() =>
				onSave({ ...getValues(), iconUrl: selectedTaskType?.icon_url })
			)}
		>
			<h2>Task Settings</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field label="Name" type="text" name="name" control={control} errors={errors} />
				<div>
					<GroupSelect
						options={tasksOptions}
						control={control}
						name="type"
						errors={errors}
						placeholder="Task type"
					/>
					<div css={{ fontSize: 12, marginTop: 6 }}>{selectedTaskType?.description}</div>
				</div>
				{taskFields.map((taskField) => (
					<InputOrSelect
						key={taskField.key}
						control={control}
						errors={errors}
						label={taskField.key}
						name={taskField.key}
						groups={outputGroups}
					/>
				))}
				{integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						control={control}
						errors={errors}
						integrationTypes={integrationTypes}
					/>
				)}
			</div>

			<Button type="submit">Save</Button>
		</Form>
	)
}
