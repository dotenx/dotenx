import _ from 'lodash'
import { useQuery } from 'react-query'
import { API_URL, getColumns, QueryKey } from '../../api'
import { columnTypeKinds } from '../../constants'
import { Endpoint, Loader } from '../ui'

interface TableEndpointsProps {
	projectTag: string
	tableName: string
}

export function TableEndpoints({ projectTag, tableName }: TableEndpointsProps) {
	const query = useQuery(QueryKey.GetColumns, () => getColumns(projectTag, tableName))
	const columns = query.data?.data.columns ?? []
	const body = _.fromPairs(
		columns
			.filter((column) => column.name !== 'id')
			.map((column) => {
				const colKind =
					columnTypeKinds.find((kind) => kind.types.includes(column.type))?.kind ?? 'none'
				return [column.name, colKind === 'number' ? 0 : colKind === 'boolean' ? false : '']
			})
	)

	if (query.isLoading) return <Loader />

	return (
		<div className="space-y-8">
			<EndpointWithBody
				label="Add a record"
				url={`${API_URL}/database/query/insert/project/${projectTag}/table/${tableName}`}
				method="POST"
				code={body}
			/>
			<Endpoint
				label="Get records"
				url={`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${tableName}`}
				method="POST"
				code={{ columns: columns.map((column) => column.name) }}
			/>
			<EndpointWithBody
				label="Update a record by id"
				url={`https://api.dotenx.com/database/query/update/project/${projectTag}/table/${tableName}/row/:id`}
				method="POST"
				code={body}
			/>
			<Endpoint
				label="Delete a record by id"
				url={`https://api.dotenx.com/database/query/delete/project/${projectTag}/table/${tableName}/row/:id`}
				method="POST"
			/>
		</div>
	)
}
