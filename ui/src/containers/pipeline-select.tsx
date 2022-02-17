import { atom, useAtom } from 'jotai'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { getPipeline, getPipelines, Pipeline, PipelineVersionData, QueryKey } from '../api'

export const selectedPipelineAtom = atom<PipelineVersionData | undefined>(undefined)

interface PipelineSelectProps {
	value: Pipeline | undefined
	onChange: (value: Pipeline) => void
}

export function PipelineSelect({ value: selected, onChange: setSelected }: PipelineSelectProps) {
	const pipelinesQuery = useQuery(QueryKey.GetPipelines, getPipelines)
	const setSelectedPipeline = useAtom(selectedPipelineAtom)[1]
	const pipelines = pipelinesQuery.data?.data
	const options = pipelines?.map((pipeline) => ({ label: pipeline.name, value: pipeline })) ?? []

	useQuery(
		[QueryKey.GetPipeline, selected],
		() => {
			if (!selected) return
			return getPipeline(selected.name, 1)
		},
		{ enabled: !!selected, onSuccess: (data) => setSelectedPipeline(data?.data) }
	)

	return (
		<Select
			css={{ width: 256, zIndex: 10 }}
			placeholder="Pipeline"
			options={options}
			name="pipeline"
			isLoading={pipelinesQuery.isLoading}
			onChange={(option) => option && setSelected(option.value)}
			value={options?.find((option) => option.value.name === selected?.name) ?? null}
		/>
	)
}
