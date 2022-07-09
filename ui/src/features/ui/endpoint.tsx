import clsx from 'clsx'
import { ReactNode } from 'react'
import { IoCheckmark, IoCopy } from 'react-icons/io5'
import useClipboard from 'react-use-clipboard'
import { JsonCode } from '../ui'

interface EndpointProps {
	label: string
	url: string
	method: 'GET' | 'POST' | 'DELETE'
	code?: Record<string, unknown>
	isResponse?: boolean
	description?: ReactNode
}

export function Endpoint({ label, url, method, code, isResponse, description }: EndpointProps) {
	return (
		<div>
			<EndpointMethod label={label} url={url} method={method} />
			<div className="mt-2 rounded bg-gray-50">
				<p className="px-2 py-1.5 text-xs font-bold">
					{isResponse ? 'Response' : 'Request'}
				</p>
				{code && <JsonCode code={code} />}
			</div>
			<div className="mt-1 text-xs text-slate-500">{description}</div>
		</div>
	)
}

interface EndpointProps {
	label: string
	url: string
	method: 'GET' | 'POST' | 'DELETE'
}

function EndpointMethod({ label, url, method: kind }: EndpointProps) {
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
