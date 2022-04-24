import { useQuery } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { getAutomationExecutions, QueryKey } from '../api'
import { Table } from '../features/ui'

export default function HistoryPage() {
	const { name: automationName } = useParams()
	const query = useQuery(
		[QueryKey.GetExecutions, automationName],
		() => {
			if (automationName) return getAutomationExecutions(automationName)
		},
		{ enabled: !!automationName }
	)
	const executions = query.data?.data ?? []

	if (!automationName) return <Navigate to="/" />

	return (
		<div className="px-32 py-16 grow">
			<Table
				title="Execution History"
				columns={[{ Header: 'Date', Cell: () => null }]}
				data={executions}
				emptyText="This automation has no execution history yet."
			/>
		</div>
	)
}
