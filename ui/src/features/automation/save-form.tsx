import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import _ from 'lodash'
import { Edge, Elements, isEdge, isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import * as z from 'zod'
import {
	createAutomation,
	createTrigger,
	CreateTriggerRequest,
	Manifest,
	QueryKey,
	Tasks,
} from '../../api'
import { flowAtom } from '../atoms'
import { EdgeData, NodeType, TaskNodeData } from '../flow'
import { useModal } from '../hooks'
import { Button, Field, Form, InputOrSelectValue } from '../ui'

const schema = z.object({
	name: z.string().min(1),
})

type Schema = z.infer<typeof schema>

export function SaveForm() {
	const { control, errors, onSubmit } = useSaveForm()

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<h2 className="text-2xl">Save automation</h2>
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

	const client = useQueryClient()
	const modal = useModal()
	const addAutomationMutation = useMutation(createAutomation)
	const addTriggerMutation = useMutation(createTrigger)
	const navigate = useNavigate()

	const [elements] = useAtom(flowAtom)

	const onSave = (values: Schema) => {
		addAutomationMutation.mutate(
			{
				name: values.name,
				manifest: mapElementsToPayload(elements),
			},
			{
				onSuccess: () => {
					modal.close()
					client.invalidateQueries(QueryKey.GetAutomations)

					const triggers = mapElementsToTriggers(elements)
					triggers.forEach((trigger) => {
						if (trigger.data)
							addTriggerMutation.mutate({
								...trigger.data,
								pipeline_name: values.name,
							})
					})
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

function mapElementsToTriggers(elements: Elements<TaskNodeData | EdgeData>) {
	return elements
		.filter(isNode)
		.filter((node) => node.type === NodeType.Trigger) as Node<CreateTriggerRequest>[]
}

function mapElementsToPayload(elements: Elements<TaskNodeData | EdgeData>): Manifest {
	const tasks: Tasks = {}

	const nodes = elements
		.filter(isNode)
		.filter((node) => node.type === NodeType.Default) as Node<TaskNodeData>[]
	const edges = elements.filter(isEdge) as Edge<EdgeData>[]

	nodes.forEach((node) => {
		if (!node.data?.name) return console.error('Node data does not exists')
		const connectedEdges = edges.filter((edge) => edge.target === node.id)
		const body = _.omit(node.data, ['name', 'type', 'integration', 'iconUrl'])
		for (const key in body) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const taskBody = body as any
			const taskFieldValue = taskBody[key] as InputOrSelectValue
			if (taskFieldValue.type === 'option') {
				taskBody[key] = { source: taskFieldValue.groupName, key: taskFieldValue.data }
			} else {
				taskBody[key] = taskFieldValue.data
			}
		}
		tasks[node.data.name] = {
			type: node.data.type,
			body,
			integration: node.data.integration ?? '',
			executeAfter: mapEdgesToExecuteAfter(connectedEdges, elements),
		}
	})

	return { tasks, triggers: { defaultTrigger: { type: 'Manual' } } }
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
