/** @jsxImportSource @emotion/react */
import { useQuery } from 'react-query'
import { getExecutionResult, QueryKey } from '../api'

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

	return (
		<div css={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
			<h2>Logs</h2>
			<p css={{ fontFamily: 'monospace' }}>{log ? log : 'No log is available'}</p>
		</div>
	)
}
