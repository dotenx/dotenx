import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
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
				headers={['Date', '']}
				items={executions.map((execution) => (
					<Item
						key={execution.Id}
						date={format(new Date(execution.StartedAt), 'yyyy/MM/dd HH:mm:ss')}
						automationName={automationName}
						executionId={execution.Id}
					/>
				))}
				emptyText="This automation has no execution history yet."
			/>
		</div>
	)
}

interface ItemProps {
	date: string
	automationName: string
	executionId: number
}

function Item({ date, automationName, executionId }: ItemProps) {
	return (
		<div className="flex items-center justify-between p-6 even:bg-gray-50 text-slate-500">
			<Link
				className="hover:underline underline-offset-2"
				to={`/automations/${automationName}/executions/${executionId}`}
			>
				{date}
			</Link>
		</div>
	)
}
