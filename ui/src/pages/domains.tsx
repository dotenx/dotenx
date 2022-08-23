import { Button, Loader, TextInput, Title } from '@mantine/core'
import { useForm, zodResolver } from '@mantine/form'
import { useClipboard } from '@mantine/hooks'
import { useState } from 'react'
import { IoCheckmark, IoCopy } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { Navigate } from 'react-router-dom'
import { QueryKey } from '../api'
import { ContentWrapper } from '../features/ui'
import { useGetProjectTag } from '../features/ui/hooks/use-get-project-tag'
import { addDomain, GetDomainResponse, getDomains, verifyDomain } from '../internal/internal-api'
import { z } from 'zod'
import { toast } from 'react-toastify'

export default function DomainsPage() {
	const { projectTag, projectName, isLoading: projectTagisLoading } = useGetProjectTag()
	const [isDomainAdded, setIsDomainAdded] = useState<boolean>()
	const getDomainsQuery = useQuery(
		[QueryKey.GetDomains, projectTag],
		() => getDomains(projectTag),
		{
			enabled: !!projectTag,
			onSuccess: () => {
				setIsDomainAdded(true)
			},
			onError: (err: any) => {
				if (err.response.status === 404) setIsDomainAdded(false)
			},
		}
	)

	if (!projectName) return <Navigate to="/" replace />

	return (
		<ContentWrapper className="lg:pr-0 lg:pl-44 ">
			<Title order={2}>Domains</Title>
			{getDomainsQuery.isLoading || projectTagisLoading || getDomainsQuery.isRefetching ? (
				<Loader className="mx-auto" />
			) : (
				<div className="mx-auto py-10  px-20 max-w-4xl ">
					{isDomainAdded ? (
						<Domain projectTag={projectTag} domainData={getDomainsQuery?.data?.data} />
					) : (
						<AddDomain projectTag={projectTag} />
					)}
				</div>
			)}
		</ContentWrapper>
	)
}

const Domain = ({
	projectTag,
	domainData,
}: {
	projectTag: string
	domainData: GetDomainResponse | undefined
}) => {
	const client = useQueryClient()

	const { mutate, isLoading } = useMutation(verifyDomain, {
		onSuccess: () => {
			toast('Domain verified successfuly', { type: 'success', autoClose: 2000 }),
				client.invalidateQueries(QueryKey.GetDomains)
		},
		onError: () => {
			toast('External domain is not verified', { type: 'error', autoClose: 2000 })
		},
	})
	return (
		<div className="grid grid-cols-1 gap-3 ">
			<div className="border-2 rounded-md text-left p-3  ">
				<h1 className="font-semibold">Domain</h1>
				<a
					target={'_blank'}
					rel="noreferrer"
					href={'//' + domainData?.external_domain}
					className="text-cyan-600 text-lg hover:text-cyan-500 transition-colors"
				>
					{domainData?.external_domain}
				</a>
				{domainData && !!domainData.tls_arn ? (
					<span className="text-green-500 float-right font-medium">verified</span>
				) : (
					<Button
						type="button"
						loading={isLoading}
						onClick={() => mutate({ projectTag })}
						className="float-right"
					>
						Verify
					</Button>
				)}
			</div>
			<div className="border-2 rounded-md text-left p-3 ">
				<NSList nsList={domainData?.ns_records} />
			</div>
		</div>
	)
}

const AddDomain = ({ projectTag }: { projectTag: string }) => {
	const client = useQueryClient()
	const schema = z.object({
		externalDomain: z
			.string()
			.regex(/^[a-zA-Z0-9]*[a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, {
				message: 'Please add a valid domain.',
			}),
	})
	const { onSubmit, ...form } = useForm({
		validate: zodResolver(schema),
	})
	const { mutate, isLoading } = useMutation(addDomain, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetDomains),
	})
	return (
		<div className="font-medium border-2 rounded-md p-3">
			<p className="my-2 ">You have not added any domains yet.</p>
			<form
				onSubmit={onSubmit((domainName) =>
					mutate({ projectTag: projectTag, domainName: domainName })
				)}
			>
				<TextInput
					label="Add your domain"
					type="text"
					required
					value=""
					placeholder="www.example.com"
					className="pt-1 pb-2"
					{...form.getInputProps('externalDomain')}
				/>
				<div className="flex justify-end">
					<Button loading={isLoading} type="submit">
						Add
					</Button>
				</div>
			</form>
		</div>
	)
}

const NSList = ({ nsList = [] }: { nsList: string[] | undefined }) => {
	const clipboard = useClipboard({ timeout: 3000 })
	const [copiedValue, setCopiedValue] = useState('')
	return (
		<div className="font-semibold">
			<h1 className="text-lg">Name Servers</h1>
			<h3 className="mt-2 mb-1 text-base ">
				Point your domain&apos;s name servers to Dotenx
			</h3>
			<p className="text-zinc-500 mb-3 text-sm font-medium">
				To use Dotenx DNS, go to your domain registrar and change your domain&apos;s name
				server to the following custom host hostnames assigned to your DNS zone.
			</p>
			{nsList.map((ns: string, index: number) => (
				<div
					onClick={() => {
						setCopiedValue(ns), clipboard.copy(ns)
					}}
					className={` p-2 px-4 hover:bg-cyan-200 transition-colors cursor-pointer flex items-center justify-between ${
						index % 2 !== 0 && 'bg-slate-100'
					} `}
					key={index}
				>
					{ns}

					{clipboard.copied && copiedValue === ns ? <IoCheckmark /> : <IoCopy />}
				</div>
			))}
		</div>
	)
}
