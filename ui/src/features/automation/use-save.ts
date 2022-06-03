import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { Edge, Elements, isEdge, isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createAutomation, Manifest, QueryKey, TaskBody, Tasks, Trigger, Triggers } from '../../api'
import { flowAtom } from '../atoms'
import { EdgeData, NodeType, TaskNodeData } from '../flow'
import { useModal } from '../hooks'
import { saveFormSchema, SaveFormSchema } from './save-form'

export function useSaveForm() {
	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<SaveFormSchema>({ resolver: zodResolver(saveFormSchema) })

	const modal = useModal()
	const addAutomationMutation = useMutation(createAutomation)
	const navigate = useNavigate()
	const client = useQueryClient()
	const [elements] = useAtom(flowAtom)

	const onSave = (values: SaveFormSchema) => {
		addAutomationMutation.mutate(
			{
				name: values.name,
				manifest: mapElementsToPayload(elements),
			},
			{
				onSuccess: () => {
					client.invalidateQueries(QueryKey.GetAutomation)
					toast('Automation saved', { type: 'success' })
					modal.close()
					navigate(`/automations/${values.name}`)
				},
			}
		)
	}

	return {
		onSubmit: handleSubmit(onSave),
		control,
		errors,
		addAutomationMutation: addAutomationMutation,
	}
}

export function mapElementsToPayload(elements: Elements<TaskNodeData | EdgeData>): Manifest {
	const tasks: Tasks = {}

	const nodes = elements
		.filter(isNode)
		.filter((node) => node.type === NodeType.Task) as Node<TaskNodeData>[]
	const edges = elements.filter(isEdge) as Edge<EdgeData>[]

	nodes.forEach((node) => {
		if (!node.data?.name) return console.error('Node data does not exists')
		const connectedEdges = edges.filter((edge) => edge.target === node.id)
		const others = node.data.others
		const body: TaskBody = {}
		for (const key in others) {
			const taskOtherValue = others[key]
			if (taskOtherValue.type === 'option') {
				body[key] = { source: taskOtherValue.groupName, key: taskOtherValue.data }
			} else {
				body[key] = taskOtherValue.data
			}
		}
		node.data.vars?.forEach((variable) => (body[variable.key] = variable.value.data))
		tasks[node.data.name] = {
			type: node.data.type,
			body,
			integration: node.data.integration ?? '',
			executeAfter: mapEdgesToExecuteAfter(connectedEdges, elements),
		}
	})

	const triggers = mapElementsToTriggers(elements)

	return { tasks, triggers }
}

function mapEdgesToExecuteAfter(
	edges: Edge<EdgeData>[],
	elements: Elements<TaskNodeData | EdgeData>
): Record<string, string[]> {
	const executeAfter: Record<string, string[]> = {}

	edges.forEach((edge) => {
		const source = elements.find((node) => node.id === edge.source) as Node<TaskNodeData>
		if (!source.data) return console.error('Source data does not exists')
		if (!edge.data) return console.error('Edge data does not exists')
		executeAfter[source.data.name] = edge.data.triggers
	})

	return executeAfter
}

function mapElementsToTriggers(elements: Elements<TaskNodeData | EdgeData>) {
	const triggers = elements
		.filter(isNode)
		.filter((node) => node.type === NodeType.Trigger)
		.map<Trigger>((node) => node.data)

	const automationTriggers: Triggers = {}
	triggers.forEach((trigger) => (automationTriggers[trigger.name] = trigger))
	return automationTriggers
}
