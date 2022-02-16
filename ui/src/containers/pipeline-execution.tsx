import { format } from 'date-fns'
import { useQuery } from 'react-query'
import Select from 'react-select'
import { getExecutions, QueryKey } from '../api'

interface PipelineExecutionProps {
	pipelineName: string | undefined
	onChange: (executionId: number) => void
}

export function PipelineExecution({ pipelineName, onChange }: PipelineExecutionProps) {
	const query = useQuery(
		[QueryKey.GetExecutions, pipelineName],
		() => {
			if (pipelineName) return getExecutions(pipelineName)
		},
		{ enabled: !!pipelineName }
	)

	const options = query.data?.data.map((execution) => ({
		label: format(new Date(execution.StartedAt), 'yyyy/MM/dd HH:mm:ss'),
		value: execution.Id,
	}))

	return (
		<Select
			css={{ width: 256, zIndex: 10 }}
			placeholder="Execution"
			name="execution"
			isLoading={query.isLoading}
			options={options}
			onChange={(option) => option && onChange(option.value)}
		/>
	)
}
