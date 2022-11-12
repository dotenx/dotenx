import _ from 'lodash'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { API_URL, getColumns, QueryKey } from '../../api'
import { columnTypeKinds } from '../../constants'
import { Endpoint, Loader } from '../ui'

interface TableEndpointsProps {
	projectTag: string
}

export function TableEndpoints({ projectTag }: TableEndpointsProps) {
	const { tableName = '', isPublic } = useParams()
	const query = useQuery(QueryKey.GetColumns, () => getColumns(projectTag, tableName))
	const columns = query.data?.data.columns ?? []
	const body = _.fromPairs(
		columns
			.filter((column) => column.name !== 'id' && column.name !== 'creator_id')
			.map((column) => {
				const colKind =
					columnTypeKinds.find((kind) => kind.types.includes(column.type))?.kind ?? 'none'
				return [
					column.name,
					colKind === 'number'
						? 0
						: colKind === 'boolean'
						? false
						: column.type.includes('array')
						? []
						: '',
				]
			})
	)

	if (query.isLoading) return <Loader />

	return (
		<div className="space-y-8 ">
			{isPublic === 'public' && (
				<Endpoint
					label="Public access"
					url={`${API_URL}/public/database/query/select/project/${projectTag}/table/${tableName}`}
					method="POST"
					code={{ columns: columns.map((column) => column.name) }}
				/>
			)}
			<Endpoint
				label="Add a record"
				url={`${API_URL}/database/query/insert/project/${projectTag}/table/`}
				method="POST"
				code={body}
			/>
			<Endpoint
				label="Get records"
				url={`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${tableName}`}
				method="POST"
				code={{ columns: columns.map((column) => column.name) }}
			/>
			<Endpoint
				label="Update a record by ID"
				url={`https://api.dotenx.com/database/query/update/project/${projectTag}/table/${tableName}/row/:id`}
				method="PUT"
				code={body}
			/>
			<Endpoint
				label="Delete a record by ID"
				url={`https://api.dotenx.com/database/query/delete/project/${projectTag}/table/${tableName}`}
				method="DELETE"
				code={{ rowId: '<id>' }}
			/>
		</div>
	)
}
