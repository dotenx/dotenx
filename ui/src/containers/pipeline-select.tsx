import { atom, useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { Node } from 'react-flow-renderer'
import { useQuery } from 'react-query'
import Select from 'react-select'
import {
	API_URL,
	getPipeline,
	getPipelines,
	Pipeline,
	PipelineEventMessage,
	PipelineVersionData,
	QueryKey,
} from '../api'
import { NodeData } from '../components/pipe-node'
import { flowAtom } from '../hooks/use-flow'

export const selectedPipelineAtom = atom<PipelineVersionData | undefined>(undefined)

export function PipelineSelect() {
	const pipelinesQuery = useQuery(QueryKey.GetPipelines, getPipelines)
	const [selected, setSelected] = useState<Pipeline>()
	const setSelectedPipeline = useAtom(selectedPipelineAtom)[1]
	const pipelines = pipelinesQuery.data?.data
	const options = pipelines?.map((pipeline) => ({ label: pipeline.name, value: pipeline })) ?? []
	const setElements = useAtom(flowAtom)[1]

	useQuery(
		[QueryKey.GetPipeline, selected],
		() => {
			if (!selected) return
			return getPipeline(selected.name, 1)
		},
		{ enabled: !!selected, onSuccess: (data) => setSelectedPipeline(data?.data) }
	)

	useEffect(() => {
		const handleReceiveMessage = (event: MessageEvent<string>) => {
			const data: PipelineEventMessage = JSON.parse(event.data)

			setElements((elements) =>
				elements.map((element) => {
					const updated = data.tasks.find((task) => task.name === element.id)
					if (!updated) return element
					const node = element as Node<NodeData>
					return {
						...node,
						data: {
							...node.data,
							status: updated.status,
							name: updated.name,
							type: node.data?.type ?? 'default',
							executionId: data.execution_id,
						},
					}
				})
			)
		}

		if (!selected) return
		const eventSource = new EventSource(`${API_URL}/execution/name/${selected.name}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [selected, setElements])

	return (
		<Select
			css={{ width: 256, zIndex: 10 }}
			placeholder="Pipeline"
			options={options}
			name="pipeline"
			isLoading={pipelinesQuery.isLoading}
			onChange={(option) => setSelected(option?.value)}
		/>
	)
}
