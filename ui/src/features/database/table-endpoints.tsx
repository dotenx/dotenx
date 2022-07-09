import clsx from 'clsx'
import _ from 'lodash'
import { ReactNode } from 'react'
import { IoCheckmark, IoCopy } from 'react-icons/io5'
import { useQuery } from 'react-query'
import useClipboard from 'react-use-clipboard'
import { API_URL, getColumns, QueryKey } from '../../api'
import { JsonCode, Loader } from '../ui'

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
			<EndpointWithBody
				label="Add a record"
				url={`${API_URL}/database/query/insert/project/${projectTag}/table/${tableName}`}
				kind="POST"
				code={body}
			/>
			<EndpointWithBody
				label="Get records"
				url={`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${tableName}`}
				kind="POST"
				code={{ columns: columns.map((column) => column.name) }}
			/>
			<EndpointWithBody
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

interface EndpointWithBodyProps {
	label: string
	url: string
	kind: 'GET' | 'POST' | 'DELETE'
	code: Record<string, unknown>
	isResponse?: boolean
	description?: ReactNode
}

export function EndpointWithBody({
	label,
	url,
	kind,
	code,
	isResponse,
	description,
}: EndpointWithBodyProps) {
	return (
		<div>
			<Endpoint label={label} url={url} kind={kind} />
			<div className="mt-2 rounded bg-gray-50">
				<p className="px-2 py-1.5 text-xs font-bold">
					{isResponse ? 'Response' : 'Request'}
				</p>
				<JsonCode code={code} />
			</div>
			<div className="mt-1 text-xs text-slate-500">{description}</div>
		</div>
	)
}

interface EndpointProps {
	label: string
	url: string
	kind: 'GET' | 'POST' | 'DELETE'
}

export function Endpoint({ label, url, kind }: EndpointProps) {
	const [isCopied, setCopied] = useClipboard(url, { successDuration: 3000 })

	return (
		<div>
			<h6 className="text-lg font-medium">{label}</h6>
			<div
				className={clsx(
					'flex items-center gap-2 p-1 mt-1 font-mono rounded border-2 relative',
					kind === 'GET' && 'bg-blue-50 border-blue-400',
					kind === 'POST' && 'bg-green-50 border-green-400',
					kind === 'DELETE' && 'bg-red-50 border-red-400'
				)}
			>
				<div
					className={clsx(
						'flex justify-center w-20 p-2 rounded text-white text-sm font-bold',
						kind === 'GET' && 'bg-blue-600',
						kind === 'POST' && 'bg-green-600',
						kind === 'DELETE' && 'bg-red-600'
					)}
				>
					{kind}
				</div>
				<span className="text-sm">{url}</span>
				<button
					className="absolute p-2 transition rounded right-1 top-[50%] -translate-y-[50%] hover:bg-gray-900/5"
					type="button"
					onClick={setCopied}
					title="Copy to Clipboard"
				>
					{isCopied ? <IoCheckmark /> : <IoCopy />}
				</button>
			</div>
		</div>
	)
}
