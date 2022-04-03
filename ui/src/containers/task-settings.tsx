/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { Control, FieldErrors, useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as z from 'zod'
import { getIntegrationsByType, getTaskFields, getTasks, QueryKey } from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { Select } from '../components/select'
import { TaskSelect } from './task-select'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
})

type Schema = z.infer<typeof schema>

interface TaskSettingsProps {
	defaultValues: Schema
	onSave: (values: Schema) => void
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
	const tasksQuery = useQuery(QueryKey.GetTasks, getTasks)
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
	const integrationType = taskFieldsQuery.data?.data.integration_type
	const selectedTaskTypeDescription = _.values(tasks)
		.flat()
		.find((task) => task.type === taskType)?.description

	return (
		<Form css={{ height: '100%' }} onSubmit={handleSubmit(() => onSave(getValues()))}>
			<h2>Node Settings</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field label="Name" type="text" name="name" control={control} errors={errors} />
				<div>
					<TaskSelect
						options={tasksOptions}
						control={control}
						name="type"
						errors={errors}
					/>
					<div css={{ fontSize: 12, marginTop: 6 }}>{selectedTaskTypeDescription}</div>
				</div>
				{taskFields.map((taskField) => (
					<Field
						key={taskField.key}
						control={control}
						errors={errors}
						label={_.capitalize(taskField.key)}
						name={taskField.key}
					/>
				))}
				{integrationType && (
					<SelectIntegration
						control={control}
						errors={errors}
						integrationType={integrationType}
					/>
				)}
			</div>

			<Button type="submit">Save</Button>
		</Form>
	)
}

interface SelectIntegrationProps {
	control: Control<Schema>
	errors: FieldErrors
	integrationType: string
}

function SelectIntegration({ control, errors, integrationType }: SelectIntegrationProps) {
	const integrationQuery = useQuery(
		[QueryKey.GetIntegrationsByType, integrationType],
		() => getIntegrationsByType(integrationType),
		{ enabled: !!integrationType }
	)

	return (
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
	)
}
