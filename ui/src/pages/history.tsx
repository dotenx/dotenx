import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CellProps } from 'react-table'
import { AutomationKind, Execution, getAutomationExecutions, QueryKey } from '../api'
import { ContentWrapper, Table } from '../features/ui'

export default function HistoryPage({ kind = 'automation' }: { kind?: AutomationKind }) {
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
		<ContentWrapper>
			<Table
				title="Execution History"
				loading={query.isLoading}
				columns={[
					{
						Header: 'Date',
						Cell: (props: CellProps<Execution>) => (
							<Link
								className="rounded hover:bg-slate-50"
								to={`${props.row.original.Id}`}
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
				emptyText={`This ${kind} has no execution history yet.`}
			/>
		</ContentWrapper>
	)
}
