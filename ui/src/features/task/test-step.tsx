import { ActionIcon, Button, Collapse, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { atom, useAtom, useSetAtom } from 'jotai'
import _ from 'lodash'
import { IoCheckmark, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { useMutation } from 'react-query'
import { AnyJson, testTask, TestTaskRequest, testTrigger, TestTriggerRequest } from '../../api'
import { TriggerSchema } from '../trigger/use-form'
import { InputOrSelectKind, JsonCode } from '../ui'
import { ComplexFieldValue } from '../ui/complex-field'
import { EditorObjectValue } from '../ui/json-editor'
import { TaskSettingsSchema } from './use-settings'

type Outputs = Record<string, Property[]>

export const outputsAtom = atom<Outputs>({})

export function TestTask({ task }: { task: TaskSettingsSchema }) {
	const testTaskMutation = useMutation(testTask)
	const [outputs, setOutputs] = useAtom(outputsAtom)
	const handleTestTask = () => {
		testTaskMutation.mutate(mapTaskValuesToPrimitives(task, outputs), {
			onSuccess: (data) => {
				const taskOutputs = findPropertyPaths(data.data.return_value.outputs, task.name)
				setOutputs((outputs) => ({ ...outputs, [task.name]: taskOutputs }))
			},
		})
	}
	const result = testTaskMutation.data?.data
	const [showResult, showResultHandlers] = useDisclosure(false)

	return (
		<div className="flex flex-col items-start w-full">
			<div className="flex items-center gap-2">
				<Button
					onClick={handleTestTask}
					loading={testTaskMutation.isLoading}
					disabled={result?.successfull}
				>
					{result?.successfull ? <IoCheckmark size={20} /> : 'Test'}
				</Button>
				<ActionIcon onClick={showResultHandlers.toggle}>
					{showResult ? <IoChevronDown /> : <IoChevronUp />}
				</ActionIcon>
			</div>
			<ScrollArea className="flex self-center w-full max-w-4xl mt-2 overflow-auto max-h-96">
				{result?.successfull && (
					<Collapse in={showResult} transitionDuration={0}>
						<JsonCode code={result} />
					</Collapse>
				)}
			</ScrollArea>
		</div>
	)
}

export function TestTrigger({ trigger }: { trigger: TriggerSchema }) {
	const testTriggerMutation = useMutation(testTrigger)
	const setOutputs = useSetAtom(outputsAtom)
	const handleTestTrigger = () => {
		testTriggerMutation.mutate(mapTriggerValuesToPrimitives(trigger), {
			onSuccess: (data) => {
				const triggerOutputs = findPropertyPaths(data.data.return_value.trigger, trigger.name)
				setOutputs((outputs) => ({ ...outputs, [trigger.name]: triggerOutputs }))
			},
		})
	}
	const result = testTriggerMutation.data?.data
	const [showResult, showResultHandlers] = useDisclosure(false)

	return (
		<div className="flex flex-col items-start w-full">
			<div className="flex items-center gap-2">
				<Button
					onClick={handleTestTrigger}
					loading={testTriggerMutation.isLoading}
					disabled={result?.triggered}
				>
					{result?.triggered ? <IoCheckmark size={20} /> : 'Test'}
				</Button>
				<ActionIcon onClick={showResultHandlers.toggle}>
					{showResult ? <IoChevronDown /> : <IoChevronUp />}
				</ActionIcon>
			</div>
			<ScrollArea className="flex self-center max-w-4xl mt-2 overflow-auto max-h-96">
				{result?.triggered && (
					<Collapse in={showResult} transitionDuration={0}>
						<JsonCode code={result} />
					</Collapse>
				)}
			</ScrollArea>
		</div>
	)
}

const mapTriggerValuesToPrimitives = (trigger: TriggerSchema): TestTriggerRequest => {
	return {
		manifest: {
			triggers: {
				trigger: {
					type: trigger.type,
					integration: trigger.integration ?? '',
					credentials: trigger.credentials,
				},
			},
		},
	}
}

const mapTaskValuesToPrimitives = (task: TaskSettingsSchema, outputs: Outputs): TestTaskRequest => {
	return {
		manifest: {
			tasks: {
				task: {
					type: task.type,
					integration: task.integration ?? '',
					body: mapTaskBodyToPrimitives(task.others, outputs),
				},
			},
		},
	}
}

const mapTaskBodyToPrimitives = (
	taskBody: TaskSettingsSchema['others'],
	outputs: Outputs
): Record<string, AnyJson> => {
	return _.fromPairs(
		_.toPairs(taskBody).map(([fieldName, fieldValue]) => [
			fieldName,
			mapFieldValueToPrimitive(
				fieldValue as ComplexFieldValue | EditorObjectValue[],
				outputs
			),
		])
	)
}

const mapFieldValueToPrimitive = (
	fieldValue: ComplexFieldValue | EditorObjectValue[],
	outputs: Outputs
): AnyJson => {
	if (_.isArray(fieldValue)) return mapJsonEditorToJsonValue(fieldValue, outputs)
	if (_.isObject(fieldValue) && 'data' in fieldValue) {
		if ('type' in fieldValue) {
			if (fieldValue.type === InputOrSelectKind.Option) {
				const taskName = (fieldValue.data as string).split('.')[0]
				const literalValue =
					outputs[taskName].find((output) => output.path === fieldValue.data)?.value ?? ''
				return literalValue
			}
		}
		return fieldValue.data
	}
	return ''
}

function mapJsonEditorToJsonValue(jsonEditorData: EditorObjectValue[], outputs: Outputs): AnyJson {
	return _.fromPairs(
		jsonEditorData.map((property) => [
			property.name,
			!_.isArray(property.value)
				? mapFieldValueToPrimitive(property.value, outputs)
				: typeof property.value[0] === 'string'
				? (property.value as string[])
				: mapJsonEditorToJsonValue(property.value as EditorObjectValue[], outputs),
		])
	)
}

const findPropertyPaths = (object: AnyJson, basePath: string): Property[] => {
	if (_.isArray(object)) {
		const arraySampleItem = object[0]
		const arraySampleItemPaths = _.isObject(arraySampleItem)
			? findPropertyPaths(arraySampleItem, basePath)
			: []
		return [
			{ kind: PropertyKind.Array, path: basePath, value: object },
			...arraySampleItemPaths,
		]
	}
	if (_.isString(object)) return [{ kind: PropertyKind.String, path: basePath, value: object }]
	if (_.isNumber(object)) return [{ kind: PropertyKind.Number, path: basePath, value: object }]
	if (_.isBoolean(object)) return [{ kind: PropertyKind.Boolean, path: basePath, value: object }]
	if (_.isNull(object) || _.isUndefined(object))
		return [{ kind: PropertyKind.Unknown, path: basePath, value: null }]

	const paths = _.toPairs(object)
		.map(([key, value]) => findPropertyPaths(value, `${basePath}.${key}`))
		.flat()
	return paths
}

export interface Property {
	kind: PropertyKind
	path: string
	value: AnyJson
}

export enum PropertyKind {
	Array = 'Array',
	String = 'String',
	Number = 'Number',
	Boolean = 'Boolean',
	Unknown = 'Unknown',
}
