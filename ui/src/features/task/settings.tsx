import { ActionIcon, Button } from '@mantine/core'
import clsx from 'clsx'
import { useAtom, useSetAtom } from 'jotai'
import { isArray } from 'lodash'
import { useEffect } from 'react'
import { Control, FieldErrors, useFieldArray } from 'react-hook-form'
import { IoAdd, IoArrowBack, IoClose } from 'react-icons/io5'
import { FieldType } from '../../api'
import { TaskBuilder } from '../../internal/task-builder'
import { taskBuilderState, taskCodeState } from '../flow'
import { IntegrationForm, SelectIntegration } from '../integration'
import {
	Description,
	Field,
	Form,
	GroupData,
	GroupSelect,
	InputOrSelect,
	InputOrSelectKind,
	Loader,
} from '../ui'
import { ComplexField, ComplexFieldProps } from '../ui/complex-field'
import { CodeField } from './code-field'
import { TaskSettingsSchema, UseTaskForm, useTaskSettings } from './use-settings'

interface TaskSettingsWithIntegrationProps {
	defaultValues: TaskSettingsSchema
	onSave: (values: TaskSettingsSchema & { iconUrl?: string; color?: string }) => void
	isAddingIntegration: boolean
	setIsAddingIntegration: (value: boolean) => void
	withIntegration: boolean
}

export function TaskSettingsWithIntegration({
	defaultValues,
	isAddingIntegration,
	onSave,
	setIsAddingIntegration,
	withIntegration,
}: TaskSettingsWithIntegrationProps) {
	const taskForm = useTaskSettings({ defaultValues, onSave })
	const [taskCode, setTaskCode] = useAtom(taskCodeState)
	const [taskBuilder, setTaskBuilder] = useAtom(taskBuilderState)
	const hasSecondPanel = isAddingIntegration || taskCode.isOpen || taskBuilder.opened
	const codeFieldValue = taskForm.watch(`others.${taskCode.key}`)
	const taskBuilderValues = taskForm.watch('others.tasks')

	useEffect(() => {
		if (taskForm.taskType) {
			setIsAddingIntegration(false)
			setTaskCode({ isOpen: false })
			setTaskBuilder({ opened: false })
		}
	}, [setIsAddingIntegration, setTaskBuilder, setTaskCode, taskForm.taskType])

	return (
		<div className={clsx('grid h-full', hasSecondPanel && 'grid-cols-2')}>
			<div className={clsx(hasSecondPanel && 'pr-10')}>
				<TaskSettings
					taskForm={taskForm}
					setIsAddingIntegration={setIsAddingIntegration}
					disableSubmit={hasSecondPanel}
					withIntegration={withIntegration}
				/>
			</div>
			{isAddingIntegration && (
				<div className="pl-10 border-l">
					<IntegrationForm
						onBack={() => setIsAddingIntegration(false)}
						integrationKind={taskForm.selectedTaskIntegrationKind}
						onSuccess={(addedIntegrationName) => {
							setIsAddingIntegration(false)
							taskForm.setValue('integration', addedIntegrationName)
						}}
					/>
				</div>
			)}
			{taskCode.isOpen && (
				<CodeField
					// TODO: PLEASE CHANGE THIS WHEN BACKEND SOMEHOW SENDS THE TYPE!
					language={taskCode.label?.includes('code') ? 'js' : 'yaml'}
					submitText={taskCode.label}
					onBack={() => setTaskCode({ isOpen: false })}
					onSubmit={(code) => {
						taskForm.setValue(`others.${taskCode.key}`, {
							type: InputOrSelectKind.Text,
							data: code,
						})
						setTaskCode({ isOpen: false })
					}}
					defaultValue={
						typeof codeFieldValue === 'object' && 'data' in codeFieldValue
							? codeFieldValue.data
							: undefined
					}
				/>
			)}
			{taskBuilder.opened && (
				<div className="space-y-2">
					<ActionIcon
						type="button"
						size="sm"
						onClick={() => setTaskBuilder({ opened: false })}
						title="Close task builder"
					>
						<IoArrowBack />
					</ActionIcon>
					<TaskBuilder
						defaultValues={isArray(taskBuilderValues) ? taskBuilderValues : undefined}
						onSubmit={(values) => {
							taskForm.setValue(`others.tasks`, values.steps)
							setTaskBuilder({ opened: false })
						}}
						otherTasksOutputs={taskForm.outputGroups}
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
	withIntegration: boolean
}

function TaskSettings({
	taskForm,
	setIsAddingIntegration,
	disableSubmit,
	withIntegration,
}: TaskSettingsProps) {
	const {
		control,
		errors,
		integrationTypes,
		onSubmit,
		outputGroups,
		selectedTaskType,
		taskFields,
		tasksOptions,
		taskTypesLoading,
		taskFieldsLoading,
		taskType,
	} = taskForm
	const setTaskCode = useSetAtom(taskCodeState)
	const setTaskBuilder = useSetAtom(taskBuilderState)
	const isCodeTask = taskFields.some((field) => field.type === FieldType.Code)

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
						loading={taskTypesLoading}
					/>
					<Description>{selectedTaskType?.description}</Description>
				</div>
				{taskFieldsLoading && <Loader className="py-4" />}
				{taskFields.map((taskField) => {
					const label = taskField.display_name || taskField.key
					return getFieldComponent(
						taskField.type,
						{
							key: `others.${taskField.key}`,
							control: control,
							errors: errors,
							label: label,
							name: `others.${taskField.key}`,
							groups: outputGroups,
							description: taskField.description,
							onClick: () =>
								setTaskCode({
									isOpen: true,
									key: taskField.key,
									label: `Add ${label}`,
								}),
							openBuilder: () => setTaskBuilder({ opened: true }),
						},
						taskType
					)
				})}
				{withIntegration && integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						control={control}
						errors={errors}
						integrationTypes={integrationTypes}
						onAddIntegration={() => setIsAddingIntegration(true)}
					/>
				)}
				{isCodeTask && (
					<Variables control={control} errors={errors} outputGroups={outputGroups} />
				)}
				{isCodeTask && <Outputs control={control} errors={errors} />}
			</div>

			<Button type="submit" disabled={disableSubmit}>
				Save
			</Button>
		</Form>
	)
}

const getFieldComponent = (
	kind: FieldType,
	props: ComplexFieldProps & {
		key: string
		onClick: () => void
		description: string
	} & { openBuilder: () => void },
	type: string
) => {
	if (type === 'Run mini tasks')
		return (
			<Button key={props.key} type="button" onClick={props.openBuilder}>
				Build A Task
			</Button>
		)

	switch (kind) {
		case FieldType.Text:
			return (
				<div key={props.key}>
					{/* TODO: PLEASE USE ComplexField WHEN BACKEND FORMATTER IS READY */}
					<ComplexField {...props} />
					<Description>{props.description}</Description>
				</div>
			)
		case FieldType.Code:
			return (
				<Button key={props.key} type="button" onClick={props.onClick}>
					Add {props.label}
				</Button>
			)
		default:
			return null
	}
}

interface VariablesProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	errors: FieldErrors
	outputGroups: GroupData[]
}

function Variables({ control, errors, outputGroups }: VariablesProps) {
	const { fields, append, remove } = useFieldArray({ control, name: 'vars' })

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm font-bold">Variables</p>
			{fields.map((field, index) => (
				<div key={field.id} className="flex items-center gap-2">
					<Field
						control={control}
						errors={errors}
						name={`vars.${index}.key`}
						key={`vars.${index}.key`}
						placeholder="Key"
					/>
					<InputOrSelect
						control={control}
						errors={errors}
						groups={outputGroups}
						name={`vars.${index}.value`}
						key={`vars.${index}.value`}
						placeholder="Value"
					/>
					<button
						type="button"
						className="flex items-center justify-center w-4 h-4 text-lg transition rounded-lg shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-600"
						onClick={() => remove(index)}
					>
						<IoClose />
					</button>
				</div>
			))}

			<button
				type="button"
				className="flex items-center justify-center w-8 h-8 mt-2 text-xl transition rounded-lg bg-gray-50 hover:bg-gray-100"
				onClick={() => append({})}
			>
				<IoAdd />
			</button>
		</div>
	)
}

interface OutputsProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	errors: FieldErrors
}
function Outputs({ control, errors }: OutputsProps) {
	const { fields, append, remove } = useFieldArray({ control, name: 'outputs' })

	return (
		<div className="flex flex-col gap-2">
			<p className="text-sm font-bold">Outputs</p>
			{fields.map((field, index) => (
				<div key={field.id} className="flex items-center gap-2">
					<div className="w-full">
						<Field
							control={control}
							errors={errors}
							name={`outputs.${index}.value`}
							key={`outputs.${index}.value`}
							placeholder="name"
						/>
					</div>
					<button
						type="button"
						className="flex items-center justify-center w-4 h-4 text-lg transition rounded-lg shrink-0 bg-rose-50 hover:bg-rose-100 text-rose-600"
						onClick={() => remove(index)}
					>
						<IoClose />
					</button>
				</div>
			))}

			<button
				type="button"
				className="flex items-center justify-center w-8 h-8 mt-2 text-xl transition rounded-lg bg-gray-50 hover:bg-gray-100"
				onClick={() => append({})}
			>
				<IoAdd />
			</button>
		</div>
	)
}
