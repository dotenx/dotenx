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
import { useQuery } from 'react-query'
import { AutomationData, getAutomationTriggers, QueryKey, Trigger } from '../../api'
import { flowAtom, selectedAutomationAtom, selectedAutomationDataAtom } from '../atoms'
import { EdgeCondition } from '../automation/edge-settings'
import { EdgeData, NodeType, TaskNodeData } from '../flow'
import { InputOrSelectValue } from '../ui'
import { getLayoutedElements as getLaidOutElements, NODE_HEIGHT, NODE_WIDTH } from './use-layout'

let id = 1
const getId = () => `task ${id++}`

let triggerId = 1
const getTriggerId = () => `trigger ${triggerId++}`

export const initialElements: Elements<TaskNodeData | EdgeData> = [
	{
		id: getId(),
		type: 'default',
		data: { name: 'task 1', type: '' },
		position: { x: 0, y: 0 },
	},
]

export function useFlow() {
	const reactFlowWrapper = useRef<HTMLDivElement>(null)
	const [reactFlowInstance, setReactFlowInstance] = useState<OnLoadParams | null>(null)
	const [elements, setElements] = useAtom(flowAtom)
	const [automation] = useAtom(selectedAutomationAtom)
	const [selectedAutomationData] = useAtom(selectedAutomationDataAtom)

	const triggersQuery = useQuery(
		[QueryKey.GetAutomationTrigger, selectedAutomationData?.name],
		() => {
			if (selectedAutomationData) return getAutomationTriggers(selectedAutomationData.name)
		},
		{ enabled: !!selectedAutomationData }
	)

	useEffect(() => {
		if (!automation) return
		const elements = mapAutomationToElements(automation)
		const triggers = mapTriggersToElements(triggersQuery.data?.data)
		const layout = getLaidOutElements([...elements, ...triggers], 'TB', NODE_WIDTH, NODE_HEIGHT)
		setElements(layout)
	}, [automation, setElements, triggersQuery.data])

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
		if (!reactFlowInstance || !reactFlowBounds) return
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		})
		const id = type === NodeType.Default ? getId() : getTriggerId()
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
			let inputOrSelectValue = { type: 'text', data: '' } as InputOrSelectValue
			if (typeof fieldValue === 'string') {
				inputOrSelectValue = { type: 'text', data: fieldValue }
			} else {
				inputOrSelectValue = {
					type: 'option',
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
			type: NodeType.Default,
			data: {
				name: key,
				type: value.type,
				integration: value.integration,
				iconUrl: value.meta_data?.icon,
				...body,
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

function mapTriggersToElements(triggers: Trigger[] | undefined) {
	if (!triggers) return []

	const triggerNodes = triggers.map((trigger) => ({
		id: trigger.name,
		position: { x: 0, y: 0 },
		type: NodeType.Trigger,
		data: { ...trigger, iconUrl: trigger.meta_data.icon },
	}))

	return triggerNodes
}
