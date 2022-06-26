import { ReactNode } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getProvider, QueryKey } from '../api'
import { Loader } from '../features/ui'

export default function ProviderPage() {
	const { providerName } = useParams()
	const query = useQuery(QueryKey.GetProvider, () => getProvider(providerName ?? ''))
	const provider = query.data?.data.provider

	if (query.isLoading || !provider) return <Loader />

	return (
		<main className="px-32 py-16 grow">
			<h3 className="text-2xl font-bold">Provider {provider.name}</h3>
			<div className="grid grid-cols-2 mt-16">
				<div className="space-y-10 ">
					<Detail label="Type" value={provider.type} />
					<Detail
						label="Front-end URL"
						value={
							<ExternalLink href={provider.front_end_url}>
								{provider.front_end_url}
							</ExternalLink>
						}
					/>
					<Detail
						label="Direct URL"
						value={
							<ExternalLink href={provider.direct_url}>
								{provider.direct_url}
							</ExternalLink>
						}
					/>
					<Detail label="Tag" value={provider.tag || 'Some tag'} />
					<Detail label="Secret" value={provider.secret} />
					<Detail label="Key" value={provider.key} />
				</div>
				<Detail label="Scopes" value={<Scopes data={provider.scopes} />} />
			</div>
		</main>
	)
}

function Detail({ label, value }: { label: string; value: string | ReactNode }) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-slate-500">{label}</p>
			<p>{value || 'No value'}</p>
		</div>
	)
}

function Scopes({ data }: { data?: string[] }) {
	if (!data) return <p>No scopes</p>

	return (
		<div className="flex flex-wrap items-center gap-2 mt-2">
			{data.map((scope) => (
				<span key={scope} className="px-2 py-1 rounded-md bg-emerald-50">
					{scope}
				</span>
			))}
		</div>
	)
}

function ExternalLink({ children, href }: { children: ReactNode; href: string }) {
	if (!href) return <p>No value</p>

	return (
		<a className="underline hover:text-slate-900" href={href} target="_blank" rel="noreferrer">
			{children}
		</a>
	)
}
