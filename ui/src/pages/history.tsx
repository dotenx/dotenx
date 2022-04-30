import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CellProps } from 'react-table'
import { Execution, getAutomationExecutions, QueryKey } from '../api'
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
				columns={[
					{
						Header: 'Date',
						Cell: (props: CellProps<Execution>) => (
							<Link
								className="rounded hover:bg-slate-50"
								to={`/automations/${automationName}/executions/${props.row.original.Id}`}
							>
								<span>
									{format(new Date(props.row.original.StartedAt), 'yyyy/MM/dd')}
								</span>
								<span className="ml-4 text-xs">
									{format(new Date(props.row.original.StartedAt), 'HH:mm:ss')}
								</span>
							</Link>
						),
					},
					{ Header: 'ID', accessor: 'Id' },
				]}
				data={executions}
				emptyText="This automation has no execution history yet."
			/>
		</div>
	)
}
