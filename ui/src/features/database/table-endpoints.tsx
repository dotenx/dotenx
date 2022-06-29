import clsx from 'clsx'
import { IoCopyOutline } from 'react-icons/io5'
import useClipboard from 'react-use-clipboard'
import { API_URL } from '../../api'
import { JsonCode } from '../automation/json-code'
import { Button } from '../ui'

interface TableEndpointsProps {
	projectTag: string
	tableName: string
}

export function TableEndpoints({ projectTag, tableName }: TableEndpointsProps) {
	return (
		<div className="space-y-8">
			<EndpointWithBody
				label="Add a record"
				url={`${API_URL}/database/query/insert/project/${projectTag}/table/${tableName}`}
				kind="POST"
				code={{ column_01: 'value_01', column_02: 'value_02', column_03: 'value_03' }}
			/>
			<EndpointWithBody
				label="Get records"
				url={`https://api.dotenx.com/database/query/select/project/${projectTag}/table/${tableName}`}
				kind="POST"
				code={{ columns: [] }}
			/>
			<EndpointWithBody
				label="Update a record by id"
				url={`https://api.dotenx.com/database/query/update/project/${projectTag}/table/${tableName}/row/:id`}
				kind="POST"
				code={{ column_01: 'value_01', column_02: 'value_02', column_03: 'value_03' }}
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
	kind: 'POST'
	code: Record<string, unknown>
}

export function EndpointWithBody({ label, url, kind, code }: EndpointWithBodyProps) {
	return (
		<div className="space-y-2">
			<Endpoint label={label} url={url} kind={kind} />
			<JsonCode code={code} />
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
			<div className="flex items-center justify-between">
				<h6 className="text-lg font-medium">{label}</h6>
				<Button
					variant="icon"
					className={clsx(
						isCopied &&
							'bg-green-100 hover:!bg-green-100 !text-green-700 border !border-green-400'
					)}
					onClick={setCopied}
				>
					<IoCopyOutline />
				</Button>
			</div>
			<div
				className={clsx(
					'flex items-center gap-2 p-1 mt-1 font-mono rounded border-2',
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
				<span>{url}</span>
			</div>
		</div>
	)
}
