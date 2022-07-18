import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { Edge, Elements, isEdge, isNode, Node } from 'react-flow-renderer'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
	AutomationKind,
	BuilderStep,
	createAutomation,
	Manifest,
	QueryKey,
	TaskBody,
	Tasks,
	Trigger,
	Triggers,
} from '../../api'
import { BuilderSteps } from '../../internal/task-builder'
import { flowAtom } from '../atoms'
import { EdgeData, TaskNodeData } from '../flow'
import { NodeType } from '../flow/types'
import { useModal } from '../hooks'
import { InputOrSelectKind } from '../ui'
import { saveFormSchema, SaveFormSchema } from './save-form'

export function useSaveForm(kind: AutomationKind) {
	const {
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<SaveFormSchema>({ resolver: zodResolver(saveFormSchema) })
	const { projectName } = useParams()

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
				is_template: kind === 'template',
				is_interaction: kind === 'interaction',
			},
			{
				onSuccess: () => {
					client.invalidateQueries(QueryKey.GetAutomation)
					toast('Automation saved', { type: 'success' })
					modal.close()
					const redirectLink =
						kind === 'automation'
							? `/automations/${values.name}`
							: kind === 'template'
							? `/builder/projects/${projectName}/templates/${values.name}`
							: `/builder/projects/${projectName}/interactions/${values.name}`
					navigate(redirectLink)
				},
			}
		)
	}

	return {
		onSubmit: handleSubmit(onSave),
		control,
		errors,
		addAutomationMutation,
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
		const body: TaskBody = {
			outputs: node.data.outputs?.map((output) => output.value) ?? null,
		}
		for (const key in others) {
			const taskOtherValue = others[key]
			if ('data' in taskOtherValue) {
				if (taskOtherValue.type === 'option') {
					body[key] = { source: taskOtherValue.groupName, key: taskOtherValue.data }
				} else {
					body[key] = taskOtherValue.data
				}
			} else if ('fn' in taskOtherValue) {
				body[key] = {
					formatter: {
						format_str: '$1',
						func_calls: {
							'1': {
								func_name: taskOtherValue.fn,
								args: taskOtherValue.args.map((arg) =>
									arg.type === InputOrSelectKind.Text
										? { value: arg.data }
										: { source: arg.groupName, key: arg.data }
								),
							},
						},
					},
				}
			} else {
				body[key] = { prop: 'value', steps: normalizeBuilderSteps(taskOtherValue) }
			}
		}
		node.data.vars?.forEach((variable) => {
			if ('data' in variable.value) {
				body[variable.key] = variable.value.data
			}
		})
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

function normalizeBuilderSteps(steps: BuilderSteps): BuilderStep[] {
	return steps.map((step) => {
		switch (step.type) {
			case 'assignment':
				return {
					type: step.type,
					params: { name: step.params.name.data, value: step.params.value.data },
				}
			case 'function_call':
				return {
					type: step.type,
					params: {
						name: step.params.fnName,
						arguments: step.params.arguments.map((arg) => arg.data),
					},
				}
			case 'foreach':
				return {
					type: step.type,
					params: {
						collection: step.params.collection.data,
						iterator: step.params.iterator.data,
						body: normalizeBuilderSteps(step.params.body),
					},
				}
			case 'if':
				return {
					type: step.type,
					params: {
						branches: step.params.branches.map((branch) => ({
							condition: branch.condition.data,
							body: normalizeBuilderSteps(branch.body),
						})),
						elseBranch: normalizeBuilderSteps(step.params.elseBranch),
					},
				}
			case 'repeat':
				return {
					type: step.type,
					params: {
						count: step.params.count.data,
						iterator: step.params.iterator.data,
						body: normalizeBuilderSteps(step.params.body),
					},
				}
			case 'output':
				return {
					type: step.type,
					params: {
						value: step.params.value.data,
					},
				}
		}
	})
}
