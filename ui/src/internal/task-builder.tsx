import { ActionIcon, Button, Divider } from '@mantine/core'
import { useToggle } from '@mantine/hooks'
import clsx from 'clsx'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { useEffect, useRef } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form'
import { IoAdd, IoChevronDown, IoChevronUp, IoClose } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { TestTaskRequest } from '../api'
import { SlidingPanes, useSlidingPane } from '../features/hooks/use-sliding-pane'
import { IntegrationForm } from '../features/integration'
import { TaskSettings } from '../features/task'
import { mapTaskBodyToPrimitives } from '../features/task/test-step'
import { TaskSettingsSchema, useTaskSettings } from '../features/task/use-settings'
import {
	Description,
	Form,
	GroupData,
	InputOrSelect,
	InputOrSelectKind,
	InputOrSelectValue,
	InputValue,
	NewSelect,
	SlidingPane,
} from '../features/ui'
import { getTaskBuilderFunctions, InternalQueryKey } from './internal-api'
import { StepsSummary } from './steps-summary'

interface Assignment {
	name: InputOrSelectValue
	value: InputOrSelectValue
}

interface Conditional {
	branches: { condition: InputOrSelectValue; body: Step[] }[]
	elseBranch: Step[]
}

interface Repeat {
	count: InputOrSelectValue
	iterator: InputOrSelectValue
	body: Step[]
}

interface Foreach {
	collection: InputOrSelectValue
	iterator: InputOrSelectValue
	body: Step[]
}

interface FunctionCall {
	fnName: string
	arguments: InputOrSelectValue[]
	output: InputOrSelectValue
}

interface OutputParams {
	value: InputOrSelectValue
}

interface VarDeclaration {
	name: InputOrSelectValue
}

interface ExecuteTask {
	accessToken: InputOrSelectValue
	url: string
	method: string
	body: TestTaskRequest
	output?: InputOrSelectValue
}

const stepTypes = [
	'assignment',
	'if',
	'repeat',
	'foreach',
	'function_call',
	'output',
	'var_declaration',
	'execute_task',
] as const

export type Step = { id: string; opened: boolean } & (
	| { type: 'assignment'; params: Assignment }
	| { type: 'if'; params: Conditional }
	| { type: 'repeat'; params: Repeat }
	| { type: 'foreach'; params: Foreach }
	| { type: 'function_call'; params: FunctionCall }
	| { type: 'output'; params: OutputParams }
	| { type: 'var_declaration'; params: VarDeclaration }
	| { type: 'execute_task'; params: ExecuteTask }
)

export type TaskBuilderValues = {
	prop: string
	steps: Step[]
}

export type BuilderSteps = Step[]

const stepTypeOptions = [
	{ label: 'Assignment', value: 'assignment' },
	{ label: 'If', value: 'if' },
	{ label: 'Repeat', value: 'repeat' },
	{ label: 'Foreach', value: 'foreach' },
	{ label: 'Function Call', value: 'function_call' },
	{ label: 'Output', value: 'output' },
	{ label: 'Variable Declaration', value: 'var_declaration' },
	{ label: 'Execute Task', value: 'execute_task' },
]

const getStepTypeLabel = (type: typeof stepTypes[number]) =>
	stepTypeOptions.find((option) => option.value === type)?.label ?? ''

const defaultStep = {
	type: 'assignment',
	params: {
		name: { type: InputOrSelectKind.Text, data: '' },
		value: { type: InputOrSelectKind.Text, data: '' },
	},
	opened: true,
} as const

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)
	return result
}

// This component renders the custom task builder section
export function TaskBuilder({
	onSubmit,
	defaultValues,
	otherTasksOutputs,
}: {
	onSubmit: (values: TaskBuilderValues) => void
	defaultValues?: BuilderSteps
	otherTasksOutputs: GroupData[]
}) {
	const form = useForm<TaskBuilderValues>({
		// defaultValues: { prop: 'value', steps: defaultValues },
		defaultValues: { prop: 'value', steps: [] },
		shouldUnregister: false,
	})
	const reset = form.reset

	useEffect(() => {
		reset({ prop: 'value', steps: defaultValues ?? [{ ...defaultStep, id: nanoid() }] })
	}, [defaultValues, reset])

	const steps = form.watch().steps
	const handleSubmit = form.handleSubmit((values) => onSubmit(values))
	const [view, toggleView] = useToggle<'detailed' | 'summary'>(['detailed', 'summary'])

	return (
		<div className="flex flex-col gap-4">
			<Button type="button" variant="light" className="self-end" onClick={() => toggleView()}>
				{view === 'detailed' ? 'Summary' : 'Detailed'}
			</Button>
			<FormProvider {...form}>
				<Form onSubmit={handleSubmit}>
					<div hidden={view === 'summary'}>
						{/* TODO: pass `otherTasksOutputs` when backend can handle it */}
						<Steps
							name="steps"
							steps={steps}
							otherTasksOutputs={[] ?? otherTasksOutputs}
							prefixNumber=""
						/>
					</div>
					{view === 'summary' && <StepsSummary steps={steps} prefixNumber="" />}
					<Button type="submit">Save Task</Button>
				</Form>
			</FormProvider>
		</div>
	)
}

function Steps({
	name,
	steps,
	otherTasksOutputs,
	prefixNumber,
}: {
	name: string
	steps: Step[]
	otherTasksOutputs: GroupData[]
	prefixNumber: string
}) {
	const { control, setValue } = useFormContext()
	const stepsFieldArray = useFieldArray({ name, control })

	const onDragEnd = (result: DropResult) => {
		// dropped outside the list
		if (!result.destination) return
		const items = reorder(steps, result.source.index, result.destination.index)
		setValue(name, items)
	}

	return (
		<DragDropContext onDragEnd={onDragEnd}>
			<Droppable droppableId="droppable">
				{(droppableProvided) => (
					<div ref={droppableProvided.innerRef}>
						{stepsFieldArray.fields.map((item, index) => (
							<Draggable key={item.id} draggableId={item.id} index={index}>
								{(draggableProvided) => (
									<div
										ref={draggableProvided.innerRef}
										{...draggableProvided.draggableProps}
										{...draggableProvided.dragHandleProps}
									>
										<TempStep
											number={`${prefixNumber}${index + 1}.`}
											onRemove={() => stepsFieldArray.remove(index)}
											name={`${name}.${index}`}
											otherTasksOutputs={otherTasksOutputs}
										/>
										<div className="w-0.5 h-3 mx-auto bg-gray-200" />
										<ActionIcon
											className="self-center mx-auto"
											type="button"
											title="Add step"
											size="xs"
											onClick={() =>
												stepsFieldArray.insert(index + 1, {
													...defaultStep,
													id: nanoid(),
												})
											}
										>
											<IoAdd />
										</ActionIcon>
										<div
											className={clsx(
												'w-0.5 h-3 mx-auto bg-gray-200',
												index === stepsFieldArray.fields.length - 1 &&
													'opacity-0'
											)}
										/>
									</div>
								)}
							</Draggable>
						))}
						{stepsFieldArray.fields.length === 0 && (
							<ActionIcon
								className="self-center mx-auto"
								type="button"
								title="Add step"
								onClick={() =>
									stepsFieldArray.append({
										...defaultStep,
										id: nanoid(),
									})
								}
							>
								<IoAdd />
							</ActionIcon>
						)}
						{droppableProvided.placeholder}
					</div>
				)}
			</Droppable>
		</DragDropContext>
	)
}

function TempStep({
	number,
	onRemove,
	name,
	otherTasksOutputs,
}: {
	number: string
	onRemove: () => void
	name: string
	otherTasksOutputs: GroupData[]
}) {
	const step = useWatch({ name })

	return (
		<Step
			number={number}
			onRemove={onRemove}
			step={step}
			name={name}
			otherTasksOutputs={otherTasksOutputs}
		/>
	)
}

function Step({
	name,
	step,
	onRemove,
	otherTasksOutputs,
	number,
}: {
	name: string
	step: Partial<Step>
	onRemove: () => void
	otherTasksOutputs: GroupData[]
	number: string
}) {
	const { control, unregister, setValue } = useFormContext()
	const paramsName = `${name}.params`
	const initialRender = useRef(true)

	useEffect(() => {
		if (step?.type && !initialRender.current) unregister(paramsName)
	}, [paramsName, step?.type, unregister])

	useEffect(() => {
		initialRender.current = false
	}, [])

	return (
		<div className="bg-white border rounded">
			<TopActionBar
				number={number}
				label={getStepTypeLabel(step?.type ?? 'assignment')}
				opened={step?.opened ?? false}
				toggle={() => setValue(`${name}.opened`, step?.opened ? false : true)}
				onRemove={onRemove}
			/>
			<div className="px-6 pb-6 space-y-4" hidden={!step?.opened}>
				<NewSelect
					label="Type"
					name={`${name}.type`}
					options={stepTypeOptions}
					control={control}
				/>
				{step?.type === 'assignment' && (
					<AssignmentFields name={paramsName} otherTasksOutputs={otherTasksOutputs} />
				)}
				{step?.type === 'if' && (
					<ConditionalFields
						name={paramsName}
						branches={step.params?.branches?.map((branch) => branch?.body) ?? []}
						elseBranch={step.params?.elseBranch ?? []}
						otherTasksOutputs={otherTasksOutputs}
						prefixNumber={number}
					/>
				)}
				{step?.type === 'repeat' && (
					<RepeatFields
						name={paramsName}
						body={step.params?.body ?? []}
						otherTasksOutputs={otherTasksOutputs}
						prefixNumber={number}
					/>
				)}
				{step?.type === 'foreach' && (
					<ForeachFields
						name={paramsName}
						body={step.params?.body ?? []}
						otherTasksOutputs={otherTasksOutputs}
						prefixNumber={number}
					/>
				)}
				{step?.type === 'function_call' && (
					<FunctionCallFields name={paramsName} otherTasksOutputs={otherTasksOutputs} />
				)}
				{step?.type === 'execute_task' && (
					<ExecuteTaskFields name={paramsName} otherTasksOutputs={otherTasksOutputs} />
				)}
				{step?.type === 'output' && (
					<OutputFields name={paramsName} otherTasksOutputs={otherTasksOutputs} />
				)}
				{step?.type === 'var_declaration' && (
					<VarDeclarationFields name={paramsName} otherTasksOutputs={otherTasksOutputs} />
				)}
			</div>
		</div>
	)
}

function AssignmentFields({
	name,
	otherTasksOutputs,
}: {
	name: string
	otherTasksOutputs: GroupData[]
}) {
	const { control } = useFormContext()

	return (
		<div className="space-y-2">
			<InputOrSelect
				label="Name"
				name={`${name}.name`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<InputOrSelect
				label="Value"
				name={`${name}.value`}
				control={control}
				groups={otherTasksOutputs}
			/>
		</div>
	)
}

function ConditionalFields({
	name,
	branches,
	elseBranch,
	otherTasksOutputs,
	prefixNumber,
}: {
	name: string
	branches: Step[][]
	elseBranch: Step[]
	otherTasksOutputs: GroupData[]
	prefixNumber: string
}) {
	const { control } = useFormContext()
	const branchesFieldArray = useFieldArray({ name: `${name}.branches`, control })
	const addBranch = () =>
		branchesFieldArray.append({
			condition: { type: InputOrSelectKind.Text, data: '' },
			body: [],
		})

	return (
		<div className="space-y-2">
			{branchesFieldArray.fields.map((branch, branchIndex) => (
				<Branch
					key={branch.id}
					name={`${name}.branches.${branchIndex}`}
					body={branches[branchIndex]}
					onRemove={() => branchesFieldArray.remove(branchIndex)}
					otherTasksOutputs={otherTasksOutputs}
					prefixNumber={prefixNumber}
				/>
			))}
			<Button type="button" size="xs" onClick={addBranch}>
				Add Condition Branch
			</Button>
			<Divider label="Else" />
			<Steps
				name={`${name}.elseBranch`}
				steps={elseBranch}
				otherTasksOutputs={otherTasksOutputs}
				prefixNumber={prefixNumber}
			/>
		</div>
	)
}

function Branch({
	name,
	body,
	onRemove,
	otherTasksOutputs,
	prefixNumber,
}: {
	name: string
	body: Step[]
	onRemove: () => void
	otherTasksOutputs: GroupData[]
	prefixNumber: string
}) {
	const { control } = useFormContext()

	return (
		<div className="border rounded">
			<ActionIcon
				title="Remove branch"
				type="button"
				color="red"
				size="sm"
				className="ml-auto"
				onClick={onRemove}
			>
				<IoClose />
			</ActionIcon>
			<div className="px-4 pb-4 space-y-2">
				<InputOrSelect
					label="Condition"
					name={`${name}.condition`}
					control={control}
					groups={otherTasksOutputs}
				/>
				<Steps
					name={`${name}.body`}
					steps={body}
					otherTasksOutputs={otherTasksOutputs}
					prefixNumber={prefixNumber}
				/>
			</div>
		</div>
	)
}

function RepeatFields({
	name,
	body,
	otherTasksOutputs,
	prefixNumber,
}: {
	name: string
	body: Step[]
	otherTasksOutputs: GroupData[]
	prefixNumber: string
}) {
	const { control } = useFormContext()

	return (
		<div className="space-y-2">
			<InputOrSelect
				label="Count"
				name={`${name}.count`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<InputOrSelect
				label="Iterator"
				name={`${name}.iterator`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<Steps
				name={`${name}.body`}
				steps={body}
				otherTasksOutputs={otherTasksOutputs}
				prefixNumber={prefixNumber}
			/>
		</div>
	)
}

function ForeachFields({
	name,
	body,
	otherTasksOutputs,
	prefixNumber,
}: {
	name: string
	body: Step[]
	otherTasksOutputs: GroupData[]
	prefixNumber: string
}) {
	const { control } = useFormContext()

	return (
		<div className="space-y-2">
			<InputOrSelect
				label="Collection"
				name={`${name}.collection`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<InputOrSelect
				label="Iterator"
				name={`${name}.iterator`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<Steps
				name={`${name}.body`}
				steps={body}
				otherTasksOutputs={otherTasksOutputs}
				prefixNumber={prefixNumber}
			/>
		</div>
	)
}

function FunctionCallFields({
	name,
	otherTasksOutputs,
}: {
	name: string
	otherTasksOutputs: GroupData[]
}) {
	const { control, watch } = useFormContext()
	const functionsQuery = useQuery(
		InternalQueryKey.GetTaskBuilderFunctions,
		getTaskBuilderFunctions
	)
	const functions = functionsQuery.data?.data.mini_tasks ?? []
	const options = functions.map((fn) => ({ label: fn.display_name, value: fn.type }))
	const selectedFunction = watch(`${name}.fnName`)
	const selectedFunctionDetails = functions.find((fn) => fn.type === selectedFunction)

	return (
		<div className="space-y-2">
			<NewSelect
				label="Function"
				name={`${name}.fnName`}
				options={options}
				control={control}
				loading={functionsQuery.isLoading}
				placeholder="What to do"
			/>
			{selectedFunctionDetails && (
				<>
					<Description>{selectedFunctionDetails.description}</Description>
					{selectedFunctionDetails.inputs?.map((input, index) => (
						<div key={input.name}>
							<InputOrSelect
								label={input.name}
								name={`${name}.arguments.${index}`}
								control={control}
								groups={otherTasksOutputs}
							/>
							<Description>{input.description}</Description>
						</div>
					))}
					<InputOrSelect
						label="Assign result to new variable (optional)"
						name={`${name}.output`}
						control={control}
						groups={otherTasksOutputs}
					/>
				</>
			)}
		</div>
	)
}
function ExecuteTaskFields({
	name,
	otherTasksOutputs,
}: {
	name: string
	otherTasksOutputs: GroupData[]
}) {
	const { control, getValues, setValue } = useFormContext()

	const slidingPane = useSlidingPane()

	const defaultValue = getValues(name)

	const taskForm = useTaskSettings({
		defaultValues: {
			name: 'task',
			type: defaultValue?.body?.manifest.tasks.task.type,
			integration: defaultValue?.body?.manifest.tasks.task.integration,
			others: mapObjectToComplexFields(defaultValue?.body?.manifest.tasks.task.body),
		},
		onSave: () => null,
	})

	useEffect(() => {
		const subscription = taskForm.watch((value) => {
			const formValues = getValues(name)
			const modifiedValue = {
				url: `${process.env.REACT_APP_API_URL}/execution/type/task/step/task`,
				method: 'POST',
				body: {
					manifest: {
						tasks: {
							task: {
								type: value.type,
								integration: value.integration ?? '',
								body: mapTaskBodyToPrimitives(
									value.others as TaskSettingsSchema['others'],
									{}
								),
							},
						},
					},
				},
			}
			setValue(name, { ...formValues, ...modifiedValue })
		})
		return () => subscription.unsubscribe()
	}, [getValues, name, setValue, taskForm, taskForm.watch])

	return (
		<div className="space-y-2">
			<InputOrSelect
				label="Access Token"
				name={`${name}.accessToken`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<TaskSettings
				mode="custom_task"
				taskForm={taskForm}
				setIsAddingIntegration={() => {
					slidingPane.open(SlidingPanes.Integration)
				}}
				disableSubmit={false}
				withIntegration={true}
			/>
			<InputOrSelect
				label="Assign result to new variable (optional)"
				name={`${name}.output`}
				control={control}
				groups={otherTasksOutputs}
			/>
			<SlidingPane
				title="Integration"
				subTitle="Select an integration"
				kind={SlidingPanes.Integration}
				hideHeader
			>
				<div className="pl-10">
					<IntegrationForm
						onBack={() => slidingPane.close()}
						integrationKind={taskForm.selectedTaskIntegrationKind}
						onSuccess={(addedIntegrationName) => {
							slidingPane.close()
							taskForm.setValue('integration', addedIntegrationName)
						}}
					/>
				</div>
			</SlidingPane>
		</div>
	)
}

const mapObjectToComplexFields = (obj: Record<string, string>) =>
	_.mapValues(obj, primitiveToComplexField)

const primitiveToComplexField = (value: string): InputValue => ({
	type: InputOrSelectKind.Text,
	data: value,
})

function OutputFields({
	name,
	otherTasksOutputs,
}: {
	name: string
	otherTasksOutputs: GroupData[]
}) {
	const { control } = useFormContext()

	return (
		<InputOrSelect
			label="Value"
			name={`${name}.value`}
			control={control}
			groups={otherTasksOutputs}
		/>
	)
}

function VarDeclarationFields({
	name,
	otherTasksOutputs,
}: {
	name: string
	otherTasksOutputs: GroupData[]
}) {
	const { control } = useFormContext()

	return (
		<InputOrSelect
			label="Name"
			name={`${name}.name`}
			control={control}
			groups={otherTasksOutputs}
		/>
	)
}

function TopActionBar({
	label,
	opened,
	toggle,
	onRemove,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	number,
}: {
	label: string
	opened: boolean
	toggle: () => void
	onRemove: () => void
	number: string
}) {
	return (
		<div className="flex justify-between">
			<div className="px-1">
				{/* <span className="text-xs font-black">{number} </span> */}
				{!opened && <span className="text-sm">{label}</span>}
			</div>
			<div className="flex gap-0.5 justify-end">
				<ActionIcon
					color="gray"
					size="sm"
					type="button"
					title={opened ? 'Hide step' : 'Show step'}
					onClick={toggle}
				>
					{opened ? <IoChevronUp /> : <IoChevronDown />}
				</ActionIcon>
				<ActionIcon
					color="red"
					size="sm"
					type="button"
					title="Remove step"
					onClick={onRemove}
				>
					<IoClose />
				</ActionIcon>
			</div>
		</div>
	)
}
