import { ActionIcon, Code } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { IoArrowBack, IoCopy } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { API_URL, getProfile, getProject, getProvider, QueryKey } from '../api'
import { ContentWrapper, Loader } from '../features/ui'

export default function ProviderPage() {
	const { providerName } = useParams()
	const query = useQuery(QueryKey.GetProvider, () => getProvider(providerName ?? ''))
	const provider = query.data?.data.provider
	const { projectName } = useParams()
	const projectQuery = useQuery(QueryKey.GetProject, () => getProject(projectName ?? ''), {
		enabled: !!projectName,
	})
	const projectTag = projectQuery.data?.data?.tag
	const profileQuery = useQuery(QueryKey.GetProfile, getProfile)
	const accountId = profileQuery.data?.data.account_id

	if (query.isLoading || projectQuery.isLoading || profileQuery.isLoading || !provider)
		return <Loader />

	return (
		<ContentWrapper>
			<div className="flex items-center gap-4">
				<ActionIcon component={Link} to={`/builder/projects/${projectName}/providers`}>
					<IoArrowBack />
				</ActionIcon>
				<h3 className="text-2xl font-bold">Provider {provider.name}</h3>
			</div>
			<div className="space-y-10">
				<Detail
					label="For user management (register/login)"
					value={`${API_URL}/user/management/project/${projectTag}/provider/${providerName}/authorize`}
					kind="url"
				/>
				<Detail
					label="For creating integration"
					value={`${API_URL}/oauth/user/provider/auth/provider/${providerName}/account_id/${accountId}`}
					kind="url"
				/>
			</div>
			<div className="grid grid-cols-2 gap-20 mt-16">
				<div className="space-y-10">
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
		</ContentWrapper>
	)
}

function Detail({
	label,
	value,
	kind = 'text',
}: {
	label: string
	value: string | ReactNode
	kind?: 'text' | 'url'
}) {
	const clipboard = useClipboard({ timeout: 500 })

	return (
		<div className="space-y-1">
			<p className="text-xs font-medium text-slate-500">{label}</p>
			{kind === 'text' && <p className="break-words">{value || 'No value'}</p>}

			{kind === 'url' && (
				<div className="flex items-center gap-2">
					<Code>{value}</Code>
					<ActionIcon type="button" onClick={() => clipboard.copy(value)}>
						<IoCopy className={clsx('text-xs', clipboard.copied && 'text-green-700')} />
					</ActionIcon>
				</div>
			)}
		</div>
	)
}

function Scopes({ data }: { data?: string[] }) {
	if (!data || data.length === 0) return <p>No scopes</p>

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
