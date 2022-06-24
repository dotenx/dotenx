import { useQuery } from 'react-query'
import { getExecutionResult, QueryKey } from '../../api'
import { Loader } from '../ui'

export interface TaskLogProps {
	executionId?: string
	taskName?: string
}

export function TaskLog({ executionId, taskName }: TaskLogProps) {
	const query = useQuery(
		QueryKey.GetResult,
		() => {
			if (executionId && taskName) return getExecutionResult(executionId, taskName)
		},
		{ enabled: !!(executionId && taskName) }
	)
	const log = query.data?.data?.log

	if (query.isLoading) return <Loader />

	return (
		<div>
			<p className="font-mono">{log ? log : 'No log is available'}</p>
		</div>
	)
}
