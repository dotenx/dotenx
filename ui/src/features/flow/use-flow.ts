import { useAtom } from 'jotai'
import _ from 'lodash'
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
	removeElements,
} from 'react-flow-renderer'
import { AutomationData, Triggers } from '../../api'
import { flowAtom, selectedAutomationAtom } from '../atoms'
import { EdgeCondition } from '../automation/edge-settings'
import { EdgeData, TaskNodeData } from '../flow'
import { InputOrSelectKind, InputOrSelectValue } from '../ui'
import { getLaidOutElements, NODE_HEIGHT, NODE_WIDTH } from './use-layout'

export enum NodeType {
	Task = 'task',
	Trigger = 'trigger',
}

let id = 1
const getId = () => `task ${id++}`

let triggerId = 1
const getTriggerId = () => `trigger ${triggerId++}`

export const initialElements: Elements<TaskNodeData | EdgeData> = [
	{
		id: getId(),
		type: NodeType.Task,
		data: { name: 'task 1', type: '' },
		position: { x: 0, y: 0 },
	},
]

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
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		})
		const id = type === NodeType.Task ? getId() : getTriggerId()
		const newNode: FlowElement<TaskNodeData> = {
			id,
			type,
			position,
			data: { name: id, type: '' },
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
		const bodyEntries = _.toPairs(value.body).map(([fieldName, fieldValue]) => {
			let inputOrSelectValue = {
				type: InputOrSelectKind.Text,
				data: '',
			} as InputOrSelectValue
			if (typeof fieldValue === 'string') {
				inputOrSelectValue = { type: InputOrSelectKind.Text, data: fieldValue }
			} else {
				inputOrSelectValue = {
					type: InputOrSelectKind.Option,
					data: fieldValue.key,
					groupName: fieldValue.source,
					iconUrl: '',
				}
			}
			return [fieldName, inputOrSelectValue]
		})
		const body = _.fromPairs(bodyEntries)
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
				others: body,
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
