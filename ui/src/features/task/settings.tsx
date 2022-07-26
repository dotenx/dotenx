import { Button } from '@mantine/core'
import clsx from 'clsx'
import { useAtom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Control, FieldErrors, FieldPath, useFieldArray } from 'react-hook-form'
import { IoAdd, IoClose } from 'react-icons/io5'
import { FieldType } from '../../api'
import { taskCodeState } from '../flow'
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
	Textarea,
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
	const hasSecondPanel = isAddingIntegration || taskCode.isOpen
	const codeFieldValue = taskForm.watch(`others.${taskCode.key}`)

	useEffect(() => {
		if (taskForm.taskType) setIsAddingIntegration(false)
	}, [setIsAddingIntegration, taskForm.taskType])

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
	} = taskForm
	const setTaskCodeState = useSetAtom(taskCodeState)
	const isCodeTask = taskFields.some((field) => field.type === FieldType.Code)

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field label="Name" name="name" control={control} errors={errors} />
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
					return getFieldComponent(taskField.type, {
						key: `others.${taskField.key}`,
						control: control,
						errors: errors,
						label: label,
						name: `others.${taskField.key}`,
						groups: outputGroups,
						description: taskField.description,
						onClick: () =>
							setTaskCodeState({
								isOpen: true,
								key: taskField.key,
								label: `Add ${label}`,
							}),
					})
				})}
				{withIntegration && integrationTypes && integrationTypes.length !== 0 && (
					<SelectIntegration
						control={control}
						errors={errors}
						name="integration"
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
	{
		onClick,
		...props
	}: ComplexFieldProps<TaskSettingsSchema, FieldPath<TaskSettingsSchema>> & {
		key: string
		onClick: () => void
		description: string
	}
) => {
	switch (kind) {
		case FieldType.Text:
			return (
				<div key={props.key}>
					<ComplexField {...props} />
					<Description>{props.description}</Description>
				</div>
			)
		case FieldType.Code:
			return (
				<Button key={props.key} type="button" onClick={onClick}>
					Add {props.label}
				</Button>
			)
		case FieldType.Object:
			return (
				<div key={props.key}>
					<Textarea {...props} />
					<Description>{props.description}</Description>
				</div>
			)
		default:
			return null
	}
}

interface VariablesProps {
	control: Control<TaskSettingsSchema>
	errors: FieldErrors<TaskSettingsSchema>
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
	control: Control<TaskSettingsSchema>
	errors: FieldErrors<TaskSettingsSchema>
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
