import { useAtom } from 'jotai'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { DragEventHandler, useEffect, useRef, useState } from 'react'
import {
	addEdge,
	ArrowHeadType,
	Connection,
	Edge,
	Elements,
	FlowElement,
	OnLoadFunc,
	OnLoadParams,
	removeElements
} from 'react-flow-renderer'
import { Arg, AutomationData, BuilderStep, TaskFieldValue, Triggers } from '../../api'
import { BuilderSteps } from '../../internal/task-builder'
import { flowAtom, selectedAutomationAtom } from '../atoms'
import { EdgeCondition } from '../automation/edge-settings'
import { EdgeData, TaskNodeData } from '../flow'
import { InputOrSelectKind, InputOrSelectValue } from '../ui'
import { ComplexFieldValue } from '../ui/complex-field'
import { EditorInput, EditorObjectValue, JsonEditorFieldValue } from '../ui/json-editor'
import { NodeType } from './types'
import { getLaidOutElements, NODE_HEIGHT, NODE_WIDTH } from './use-layout'

export function useFlow() {
	const reactFlowWrapper = useRef<HTMLDivElement>(null)
	const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams | null>(null)
	const [elements, setElements] = useAtom(flowAtom)
	const [automation] = useAtom(selectedAutomationAtom)

	useEffect(() => {
		if (!automation) return
		const elements = mapAutomationToElements(automation)
		const triggers = mapTriggersToElements(automation.manifest.triggers)
		const layout = getLaidOutElements([...elements, ...triggers], 'TB', NODE_WIDTH, NODE_HEIGHT)
		setElements(layout)
	}, [automation, setElements])

	const onConnect = (params: Edge | Connection) => {
		setElements((els) => addEdge({ ...params, arrowHeadType: ArrowHeadType.Arrow }, els))
	}

	const onElementsRemove = (elementsToRemove: Elements) => {
		setElements((els) => removeElements(elementsToRemove, els))
	}

	const onLoad: OnLoadFunc = (reactFlowInstance) => {
		setReactFlowInstance(reactFlowInstance)
		reactFlowInstance.fitView()
	}

	const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault()
		event.dataTransfer.dropEffect = 'move'
	}

	const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault()

		const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
		const type = event.dataTransfer.getData('application/reactflow')
		if (!type) return
		if (!reactFlowInstance || !reactFlowBounds) return
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left - 45,
			y: event.clientY - reactFlowBounds.top - 24,
		})
		const id = nanoid()
		const newNode: FlowElement<TaskNodeData> = {
			id,
			type,
			position,
			data: { name: type === NodeType.Task ? 'task' : 'trigger', type: '' },
		}

		setElements((es) => es.concat(newNode))
	}

	const updateElement = (id: string, data: TaskNodeData | EdgeData) => {
		setElements((els) => els.map((el) => (el.id === id ? { ...el, data } : el)))
	}

	return {
		reactFlowWrapper,
		elements,
		onConnect,
		onElementsRemove,
		onLoad,
		onDragOver,
		onDrop,
		updateElement,
	}
}

function mapAutomationToElements(automation: AutomationData): Elements<TaskNodeData | EdgeData> {
	const nodes = Object.entries(automation.manifest.tasks).map(([key, value]) => {
		const bodyEntries = _.toPairs(value.body)
			.filter(([, fieldValue]) => !!fieldValue)
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.map(([fieldName, fieldValue]) => toFieldValue(fieldValue!, fieldName))
		const vars = _.toPairs(_.omit(value.body, ['code', 'dependency', 'outputs']))
			.filter(([, fieldValue]) => !!fieldValue)
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			.map(([fieldName, fieldValue]) => toFieldValue(fieldValue!, fieldName))
			.map(([fieldName, fieldValue]) => ({
				key: fieldName,
				value: fieldValue as InputOrSelectValue,
			}))
		const body = _.fromPairs(bodyEntries)
		const hasOutputs = _.keys(value.body).includes('outputs')

		return {
			id: key,
			position: { x: 0, y: 0 },
			type: NodeType.Task,
			data: {
				name: key,
				type: value.type,
				integration: value.integration,
				iconUrl: value.meta_data?.icon,
				color: value.meta_data?.node_color,
				others: hasOutputs ? _.omit(body, 'outputs') : body,
				// TODO: THIS IS HARDCODED :(
				vars: hasOutputs ? vars : undefined,
				outputs:
					value.body.outputs?.type === 'customOutputs'
						? value.body.outputs.outputs.map((value) => ({ value }))
						: undefined,
			},
		}
	})
	const edges = Object.entries(automation.manifest.tasks).flatMap(([target, task]) =>
		Object.entries(task.executeAfter).map(([source, triggers]) => ({
			id: `${source}to${target}`,
			source,
			target,
			arrowHeadType: ArrowHeadType.Arrow,
			data: {
				triggers: triggers as EdgeCondition[],
			},
		}))
	)

	return [...nodes, ...edges]
}

function toFieldValue(fieldValue: TaskFieldValue, fieldName: string) {
	if (!fieldValue) return ['', '']

	let normalized:
		| ComplexFieldValue
		| BuilderSteps
		| { value: string }[]
		| EditorObjectValue[]
		| string[] = {
		type: InputOrSelectKind.Text,
		data: '',
	}

	switch (fieldValue.type) {
		case 'directValue':
			if (_.isArray(fieldValue.value)) normalized = fieldValue.value
			else if (_.isString(fieldValue.value))
				normalized = { type: InputOrSelectKind.Text, data: fieldValue.value }
			else normalized = mapToUiTaskBuilder(fieldValue.value.steps)
			break
		case 'refrenced':
			normalized = {
				type: InputOrSelectKind.Option,
				data: fieldValue.key,
				groupName: fieldValue.source,
				iconUrl: '',
			}
			break
		case 'nested':
			normalized = { kind: 'nested', data: fieldValue.nestedKey }
			break
		case 'json':
			normalized = mapToEditorJson(fieldValue.value)
			break
		case 'json_array':
			normalized = { kind: 'json-array', data: JSON.stringify(fieldValue.value, null, 2) }
			break
		case 'formatted':
			{
				const fn = fieldValue.formatter.func_calls[1]
				const args = fn?.args?.map(argToInputOrSelect)
				normalized = { fn: fn?.function, args }
			}
			break
		case 'customOutputs':
			normalized = fieldValue.outputs.map((output) => ({ value: output }))
			break
	}

	return [fieldName, normalized] as [
		string,
		ComplexFieldValue | BuilderSteps | { value: string }[]
	]
}

function mapToEditorJson(json: Record<string, TaskFieldValue>): EditorObjectValue[] {
	return _.toPairs(json).map(([name, value]) => ({
		name,
		id: nanoid(),
		value: toJsonEditorProperty(value),
	}))
}

function toJsonEditorProperty(value: TaskFieldValue): JsonEditorFieldValue {
	if (value.type !== 'json') {
		return toFieldValue(value, '')[1] as EditorInput
	} else {
		return _.toPairs(value.value).map(([name, innerValue]) => ({
			id: nanoid(),
			name,
			value: toJsonEditorProperty(innerValue),
		}))
	}
}

const argToInputOrSelect = (arg: Arg): InputOrSelectValue => {
	return 'value' in arg
		? { type: InputOrSelectKind.Text, data: arg.value as string }
		: { type: InputOrSelectKind.Option, data: arg.key, groupName: arg.source, iconUrl: '' }
}

function mapTriggersToElements(triggers: Triggers | undefined) {
	if (!triggers) return []

	const triggerNodes = _.entries(triggers).map(([name, triggerData]) => ({
		id: name,
		position: { x: 0, y: 0 },
		type: NodeType.Trigger,
		data: { ...triggerData, iconUrl: triggerData.meta_data.icon },
	}))

	return triggerNodes
}

function mapToUiTaskBuilder(steps: BuilderStep[]): BuilderSteps {
	return steps.map((step) => {
		switch (step.type) {
			case 'assignment':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						name: { type: InputOrSelectKind.Text, data: step.params.name },
						value: { type: InputOrSelectKind.Text, data: step.params.value },
					},
				}
			case 'function_call':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						fnName: step.params.name,
						arguments: step.params.arguments.map((arg) => ({
							type: InputOrSelectKind.Text,
							data: arg,
						})),
						output: { type: InputOrSelectKind.Text, data: step.params.output ?? '' },
					},
				}
			case 'execute_task':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						url: step.params.url,
						method: step.params.method,
						body: step.params.body,
						accessToken: { type: InputOrSelectKind.Text, data: step.params.headers['DTX-auth'] ?? '' },
						output: { type: InputOrSelectKind.Text, data: step.params.output ?? '' },
					},
				}
			case 'foreach':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						collection: { type: InputOrSelectKind.Text, data: step.params.collection },
						iterator: { type: InputOrSelectKind.Text, data: step.params.iterator },
						body: mapToUiTaskBuilder(step.params.body),
					},
				}
			case 'if':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						branches: step.params.branches.map((branch) => ({
							condition: { type: InputOrSelectKind.Text, data: branch.condition },
							body: mapToUiTaskBuilder(branch.body),
						})),
						elseBranch: mapToUiTaskBuilder(step.params.elseBranch),
					},
				}
			case 'repeat':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						count: { type: InputOrSelectKind.Text, data: step.params.count },
						iterator: { type: InputOrSelectKind.Text, data: step.params.iterator },
						body: mapToUiTaskBuilder(step.params.body),
					},
				}
			case 'output':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						value: { type: InputOrSelectKind.Text, data: step.params.value },
					},
				}
			case 'var_declaration':
				return {
					id: nanoid(),
					opened: true,
					type: step.type,
					params: {
						name: { type: InputOrSelectKind.Text, data: step.params.name },
					},
				}
		}
	})
}
