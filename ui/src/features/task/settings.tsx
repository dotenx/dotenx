/** @jsxImportSource @emotion/react */
import { SelectIntegration } from '../integration'
import { Button, Field, Form, GroupSelect, InputOrSelect, InputOrSelectValue } from '../ui'
import { TaskSettingsSchema, useTaskSettings } from './use-settings'

interface TaskSettingsProps {
	defaultValues: TaskSettingsSchema
	onSave: (
		values: TaskSettingsSchema & { iconUrl?: string } & Record<
				string,
				string | InputOrSelectValue | undefined
			>
	) => void
}

export function TaskSettings({ defaultValues, onSave }: TaskSettingsProps) {
	const {
		control,
		errors,
		integrationTypes,
		onSubmit,
		outputGroups,
		selectedTaskType,
		taskFields,
		tasksOptions,
	} = useTaskSettings({ defaultValues, onSave })

	return (
		<Form css={{ height: '100%' }} onSubmit={onSubmit}>
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
