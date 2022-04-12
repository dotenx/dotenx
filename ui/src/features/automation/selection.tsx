/** @jsxImportSource @emotion/react */
import { useAtom } from 'jotai'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { Automation, getAutomation, getAutomations, QueryKey } from '../../api'
import { selectedPipelineAtom } from '../atoms'

interface PipelineSelectProps {
	value: Automation | undefined
	onChange: (value: Automation) => void
}

export function PipelineSelect({ value: selected, onChange: setSelected }: PipelineSelectProps) {
	const pipelinesQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const setSelectedPipeline = useAtom(selectedPipelineAtom)[1]
	const pipelines = pipelinesQuery.data?.data
	const options = pipelines?.map((pipeline) => ({ label: pipeline.name, value: pipeline })) ?? []

	useQuery(
		[QueryKey.GetAutomation, selected],
		() => {
			if (!selected) return
			return getAutomation(selected.name)
		},
		{ enabled: !!selected, onSuccess: (data) => setSelectedPipeline(data?.data) }
	)

	return (
		<Select
			css={{ width: 256, zIndex: 10 }}
			placeholder="Automation"
			options={options}
			name="pipeline"
			isLoading={pipelinesQuery.isLoading}
			onChange={(option) => option && setSelected(option.value)}
			value={options?.find((option) => option.value.name === selected?.name) ?? null}
		/>
	)
}
