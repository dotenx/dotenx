import clsx from 'clsx'
import { useEffect } from 'react'
import { NewIntegration, SelectIntegration } from '../integration'
import { Button, Field, Form, GroupSelect, InputOrSelect } from '../ui'
import { TaskSettingsSchema, UseTaskForm, useTaskSettings } from './use-settings'

interface TaskSettingsWithIntegrationProps {
	defaultValues: TaskSettingsSchema
	onSave: (values: TaskSettingsSchema & { iconUrl?: string; color?: string }) => void
	isAddingIntegration: boolean
	setIsAddingIntegration: (value: boolean) => void
}

export function TaskSettingsWithIntegration({
	defaultValues,
	isAddingIntegration,
	onSave,
	setIsAddingIntegration,
}: TaskSettingsWithIntegrationProps) {
	const taskForm = useTaskSettings({ defaultValues, onSave })

	useEffect(() => {
		if (taskForm.taskType) setIsAddingIntegration(false)
	}, [setIsAddingIntegration, taskForm.taskType])

	return (
		<div className={clsx('grid h-full', isAddingIntegration && 'grid-cols-2')}>
			<div className={clsx(isAddingIntegration && 'pr-10')}>
				<TaskSettings
					taskForm={taskForm}
					setIsAddingIntegration={setIsAddingIntegration}
					disableSubmit={isAddingIntegration}
				/>
			</div>
			{isAddingIntegration && (
				<div className="pl-10 border-l">
					<NewIntegration
						onBack={() => setIsAddingIntegration(false)}
						integrationKind={taskForm.selectedTaskIntegrationKind}
						onSuccess={(addedIntegrationName) => {
							setIsAddingIntegration(false)
							taskForm.setValue('integration', addedIntegrationName)
						}}
					/>
				</div>
			)}
		</div>
	)
}

interface TaskSettingsProps {
	taskForm: UseTaskForm
	setIsAddingIntegration: (value: boolean) => void
	disableSubmit: boolean
}

function TaskSettings({ taskForm, setIsAddingIntegration, disableSubmit }: TaskSettingsProps) {
	const {
		control,
		errors,
		integrationTypes,
		onSubmit,
		outputGroups,
		selectedTaskType,
		taskFields,
		tasksOptions,
	} = taskForm

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field label="Name" type="text" name="name" control={control} errors={errors} />
				<div>
					<GroupSelect
						options={tasksOptions}
						control={control}
						name="type"
						errors={errors}
						placeholder="Task type"
					/>
					<div className="text-xs mt-1.5">{selectedTaskType?.description}</div>
				</div>
				{taskFields.map((taskField) => (
					<InputOrSelect
						key={`others.${taskField.key}`}
						control={control}
						errors={errors}
						label={taskField.key}
						name={`others.${taskField.key}`}
						groups={outputGroups}
					/>
				))}
				{integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						control={control}
						errors={errors}
						integrationTypes={integrationTypes}
						onAddIntegration={() => setIsAddingIntegration(true)}
					/>
				)}
			</div>

			<Button type="submit" disabled={disableSubmit}>
				Save
			</Button>
		</Form>
	)
}
