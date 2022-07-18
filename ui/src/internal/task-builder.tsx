import { ActionIcon, Button, Divider, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import _ from 'lodash'
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { IoAdd, IoChevronDown, IoChevronUp, IoClose } from 'react-icons/io5'
import { useQuery } from 'react-query'
import {
	Description,
	Form,
	GroupData,
	InputOrSelect,
	InputOrSelectKind,
	InputOrSelectValue,
	NewSelect,
} from '../features/ui'
import { getTaskBuilderFunctions, InternalQueryKey } from './internal-api'

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
}

interface OutputParams {
	value: InputOrSelectValue
}

type Step =
	| { type: 'assignment'; params: Assignment }
	| { type: 'if'; params: Conditional }
	| { type: 'repeat'; params: Repeat }
	| { type: 'foreach'; params: Foreach }
	| { type: 'function_call'; params: FunctionCall }
	| { type: 'output'; params: OutputParams }

export type TaskBuilderValues = {
	prop: string
	steps: Step[]
}

export type BuilderSteps = Step[]

const stepTypes = ['assignment', 'if', 'repeat', 'foreach', 'function_call', 'output'] as const

const stepTypeOptions = stepTypes.map((type) => ({
	label: _.capitalize(type.split('_').join(' ')),
	value: type,
}))

const getStepTypeLabel = (type: typeof stepTypes[number]) =>
	stepTypeOptions.find((option) => option.value === type)?.label ?? ''

const defaultStep: Step = {
	type: 'assignment',
	params: {
		name: { type: InputOrSelectKind.Text, data: '' },
		value: { type: InputOrSelectKind.Text, data: '' },
	},
}

export function TaskBuilder({
	onSubmit,
	defaultValues = [defaultStep],
	otherTasksOutputs,
}: {
	onSubmit: (values: TaskBuilderValues) => void
	defaultValues?: BuilderSteps
	otherTasksOutputs: GroupData[]
}) {
	const form = useForm<TaskBuilderValues>({
		defaultValues: { prop: 'value', steps: defaultValues },
		shouldUnregister: true,
	})
	const values = form.watch()
	const steps = values.steps
	const handleSubmit = form.handleSubmit((values) => onSubmit(values))

	return (
		<FormProvider {...form}>
			<Form onSubmit={handleSubmit}>
				{/* TODO: pass `otherTasksOutputs` when backend can handle it */}
				<Steps name="steps" steps={steps} otherTasksOutputs={[] ?? otherTasksOutputs} />
				<Button type="submit">Save Task</Button>
			</Form>
		</FormProvider>
	)
}

function Steps({
	name,
	steps,
	otherTasksOutputs,
}: {
	name: string
	steps: Step[]
	otherTasksOutputs: GroupData[]
}) {
	const { control } = useFormContext()
	const stepsFieldArray = useFieldArray({ name, control })
	const addStep = () => stepsFieldArray.append(defaultStep)

	return (
		<div>
			{stepsFieldArray.fields.map((item, index) => (
				<Step
					key={item.id}
					onRemove={() => stepsFieldArray.remove(index)}
					step={steps[index]}
					name={`${name}.${index}`}
					otherTasksOutputs={otherTasksOutputs}
				/>
			))}
			<ActionIcon
				className="self-center mx-auto"
				type="button"
				title="Add step"
				onClick={addStep}
			>
				<IoAdd />
			</ActionIcon>
		</div>
	)
}

function Step({
	name,
	step,
	onRemove,
	otherTasksOutputs,
}: {
	name: string
	step: Step
	onRemove: () => void
	otherTasksOutputs: GroupData[]
}) {
	const { control } = useFormContext()
	const paramsName = `${name}.params`
	const [opened, handlers] = useDisclosure(true)

	return (
		<div>
			<div className="border rounded">
				<TopActionBar
					label={getStepTypeLabel(step?.type)}
					opened={opened}
					toggle={handlers.toggle}
					onRemove={onRemove}
				/>
				<div className="px-6 pb-6 space-y-4" hidden={!opened}>
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
							branches={step.params.branches?.map((branch) => branch.body)}
							elseBranch={step.params.elseBranch}
							otherTasksOutputs={otherTasksOutputs}
						/>
					)}
					{step?.type === 'repeat' && (
						<RepeatFields
							name={paramsName}
							body={step.params.body}
							otherTasksOutputs={otherTasksOutputs}
						/>
					)}
					{step?.type === 'foreach' && (
						<ForeachFields
							name={paramsName}
							body={step.params.body}
							otherTasksOutputs={otherTasksOutputs}
						/>
					)}
					{step?.type === 'function_call' && (
						<FunctionCallFields
							name={paramsName}
							otherTasksOutputs={otherTasksOutputs}
						/>
					)}
					{step?.type === 'output' && (
						<OutputFields name={paramsName} otherTasksOutputs={otherTasksOutputs} />
					)}
				</div>
			</div>
			<div className="w-1 h-6 mx-auto bg-gray-200" />
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
}: {
	name: string
	branches: Step[][]
	elseBranch: Step[]
	otherTasksOutputs: GroupData[]
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
			/>
		</div>
	)
}

function Branch({
	name,
	body,
	onRemove,
	otherTasksOutputs,
}: {
	name: string
	body: Step[]
	onRemove: () => void
	otherTasksOutputs: GroupData[]
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
				<Steps name={`${name}.body`} steps={body} otherTasksOutputs={otherTasksOutputs} />
			</div>
		</div>
	)
}

function RepeatFields({
	name,
	body,
	otherTasksOutputs,
}: {
	name: string
	body: Step[]
	otherTasksOutputs: GroupData[]
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
			<Steps name={`${name}.body`} steps={body} otherTasksOutputs={otherTasksOutputs} />
		</div>
	)
}

function ForeachFields({
	name,
	body,
	otherTasksOutputs,
}: {
	name: string
	body: Step[]
	otherTasksOutputs: GroupData[]
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
			<Steps name={`${name}.body`} steps={body} otherTasksOutputs={otherTasksOutputs} />
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
				</>
			)}
		</div>
	)
}

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

function TopActionBar({
	label,
	opened,
	toggle,
	onRemove,
}: {
	label: string
	opened: boolean
	toggle: () => void
	onRemove: () => void
}) {
	return (
		<div className="flex justify-between">
			<div>{!opened && <Text size="sm">{label}</Text>}</div>
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
