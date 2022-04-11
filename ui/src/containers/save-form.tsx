/** @jsxImportSource @emotion/react */
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import _ from 'lodash'
import { Edge, Elements, isEdge, isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import * as z from 'zod'
import { addPipeline, addTrigger, AddTriggerPayload, Manifest, QueryKey, Tasks } from '../api'
import { Button } from '../components/button'
import { Field } from '../components/field'
import { Form } from '../components/form'
import { InputOrSelectValue } from '../components/input-or-select'
import { EdgeData } from '../components/pipe-edge'
import { NodeType, TaskNodeData } from '../components/task-node'
import { flowAtom } from '../hooks/use-flow'
import { useModal } from '../hooks/use-modal'

const schema = z.object({
	name: z.string().min(1),
})

type Schema = z.infer<typeof schema>

export function SaveForm() {
	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<Schema>({ resolver: zodResolver(schema) })

	const client = useQueryClient()
	const modal = useModal()
	const addPipelineMutation = useMutation(addPipeline)
	const addTriggerMutation = useMutation(addTrigger)

	const [elements] = useAtom(flowAtom)

	const onSubmit = (values: Schema) => {
		addPipelineMutation.mutate(
			{
				name: values.name,
				manifest: mapElementsToPayload(elements),
			},
			{
				onSuccess: () => {
					modal.close()
					client.invalidateQueries(QueryKey.GetPipelines)

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

	return (
		<Form css={{ height: '100%' }} onSubmit={handleSubmit(onSubmit)}>
			<h2>Save automation</h2>
			<div css={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 20 }}>
				<Field name="name" label="Automation name" control={control} errors={errors} />
			</div>
			<Button type="submit" isLoading={addPipelineMutation.isLoading}>
				Save
			</Button>
		</Form>
	)
}

function mapElementsToTriggers(elements: Elements<TaskNodeData | EdgeData>) {
	return elements
		.filter(isNode)
		.filter((node) => node.type === NodeType.Trigger) as Node<AddTriggerPayload>[]
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
