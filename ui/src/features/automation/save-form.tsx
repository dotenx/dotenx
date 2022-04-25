import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { Edge, Elements, isEdge, isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import {
	createAutomation,
	Manifest,
	QueryKey,
	TaskBody,
	Tasks,
	Trigger,
	Triggers,
	updateAutomation,
} from '../../api'
import { flowAtom } from '../atoms'
import { EdgeData, NodeType, TaskNodeData } from '../flow'
import { useModal } from '../hooks'
import { Button, Field, Form } from '../ui'

const schema = z.object({
	name: z.string().min(1),
})

type Schema = z.infer<typeof schema>

export function SaveForm() {
	const { control, errors, onSubmit } = useSaveForm()

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field name="name" label="Automation name" control={control} errors={errors} />
			</div>
			<Button type="submit">Save</Button>
		</Form>
	)
}

function useSaveForm() {
	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<Schema>({ resolver: zodResolver(schema) })

	const modal = useModal()
	const addAutomationMutation = useMutation(createAutomation)
	const navigate = useNavigate()
	const client = useQueryClient()
	const [elements] = useAtom(flowAtom)

	const onSave = (values: Schema) => {
		addAutomationMutation.mutate(
			{
				name: values.name,
				manifest: mapElementsToPayload(elements),
			},
			{
				onSuccess: () => {
					client.invalidateQueries(QueryKey.GetAutomation)
					modal.close()
				},
			}
		)
	}

	const onSubmit = handleSubmit((values) => {
		onSave(values)
		navigate(`/automations/${values.name}`)
	})

	return {
		onSubmit,
		control,
		errors,
		addAutomationMutation: addAutomationMutation,
	}
}

export function useUpdateAutomation() {
	const client = useQueryClient()
	const updateAutomationMutation = useMutation(updateAutomation)
	const [elements] = useAtom(flowAtom)

	const onUpdate = (values: Schema) => {
		const manifest = mapElementsToPayload(elements)
		updateAutomationMutation.mutate(
			{ name: values.name, manifest },
			{ onSuccess: () => client.invalidateQueries(QueryKey.GetAutomation) }
		)
	}

	return {
		onUpdate,
	}
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

function mapElementsToPayload(elements: Elements<TaskNodeData | EdgeData>): Manifest {
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
