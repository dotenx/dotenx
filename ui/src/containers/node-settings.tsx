import { zodResolver } from '@hookform/resolvers/zod'
import _ from 'lodash'
import { useForm } from 'react-hook-form'
import { useQuery } from 'react-query'
import * as z from 'zod'
import { getTaskFields, getTasks, QueryKey } from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { Select } from '../components/select'

const schema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
})

type Schema = z.infer<typeof schema>

interface NodeSettingsProps {
	defaultValues: Schema
	onSave: (values: Schema) => void
}

export function NodeSettings({ defaultValues, onSave }: NodeSettingsProps) {
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
	const tasksOptions = tasks?.map((task) => ({ label: task, value: task }))
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

	return (
		<Form css={{ height: '100%' }} onSubmit={handleSubmit(() => onSave(getValues()))}>
			<h2>Node Settings</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field label="Name" type="text" name="name" control={control} errors={errors} />
				<Select
					label="Type"
					name="type"
					control={control}
					options={tasksOptions}
					errors={errors}
					isLoading={tasksQuery.isLoading}
				/>
				{taskFields.map((taskField) => (
					<Field
						key={taskField.key}
						control={control}
						errors={errors}
						label={_.capitalize(taskField.key)}
						name={taskField.key}
					/>
				))}
			</div>
			<Button type="submit">Save</Button>
		</Form>
	)
}
