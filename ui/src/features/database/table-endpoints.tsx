import _ from 'lodash'
import { useQuery } from 'react-query'
import { API_URL, getColumns, QueryKey } from '../../api'
import { Endpoint, Loader } from '../ui'

interface TableEndpointsProps {
	projectTag: string
	tableName: string
}

export function TableEndpoints({ projectTag, tableName }: TableEndpointsProps) {
	const query = useQuery(QueryKey.GetColumns, () => getColumns(projectTag, tableName))
	const columns = query.data?.data.columns ?? []
	const body = _.fromPairs(columns.map((column) => [column.name, column.type]))

	if (query.isLoading) return <Loader />

	return (
		<div className="space-y-8">
			<Endpoint
				label="Add a record"
				url={`${API_URL}/database/query/insert/project/${projectTag}/table/${tableName}`}
				kind="POST"
				code={body}
			/>
			<Endpoint
				label="Get records"
				url={`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${tableName}`}
				kind="POST"
				code={{ columns: columns.map((column) => column.name) }}
			/>
			<Endpoint
				label="Update a record by id"
				url={`https://api.dotenx.com/database/query/update/project/${projectTag}/table/${tableName}/row/:id`}
				kind="POST"
				code={body}
			/>
			<Endpoint
				label="Delete a record by id"
				url={`https://api.dotenx.com/database/query/delete/project/${projectTag}/table/${tableName}/row/:id`}
				kind="POST"
			/>
		</div>
	)
}
