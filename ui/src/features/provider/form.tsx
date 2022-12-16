import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Button, Code } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { useForm } from 'react-hook-form'
import { IoCheckmark, IoCopy } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import {
	API_URL,
	createProvider,
	getIntegrationKinds,
	getProfile,
	getProject,
	QueryKey,
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { toOption } from '../../utils'
import { useModal } from '../hooks'
import { CreatableSelect, Field, Form, NewSelect } from '../ui'

const schema = z.object({
	name: z
		.string()
		.min(2)
		.max(20)
		.regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
			message:
				'Name should start with a letter and contain only letters, numbers, and underscores',
		}),
	type: z.string().min(1),
	key: z.string().min(1),
	secret: z.string().min(1),
	front_end_url: z.string().url(),
	scopes: z.array(z.string().min(1)).optional(),
	direct_url: z.string().url().optional(),
})

type Schema = z.infer<typeof schema>

export function ProviderForm() {
	const modal = useModal()
	const client = useQueryClient()
	const integrationTypesQuery = useQuery(QueryKey.GetIntegrationTypes, getIntegrationKinds)
	const mutation = useMutation(createProvider, {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetProviders)
			modal.close()
		},
	})
	const form = useForm<Schema>({
		defaultValues: {
			name: '',
			type: '',
			key: '',
			secret: '',
			scopes: [],
			front_end_url: '',
		},
		resolver: zodResolver(schema),
	})
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))
	const integrationKindOptions = integrationTypesQuery.data?.data
		.filter((integration) => !!integration.oauth_provider)
		.map((integration) => integration.type)
		.map(toOption)
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const providerName = form.watch('name')

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="name"
					label="Name"
					placeholder="Provider name"
				/>
				<NewSelect
					control={form.control}
					errors={form.formState.errors}
					options={integrationKindOptions}
					loading={integrationTypesQuery.isLoading}
					name="type"
					label="Type"
					placeholder="Provider kind"
				/>
				<CallbackUrls projectName={projectName} providerName={providerName} />
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="key"
					label="Key"
					placeholder="Provider key"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="secret"
					label="Secret"
					placeholder="Provider secret"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="front_end_url"
					label="Front-end URL"
					placeholder="Front-end URL to redirect page"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="direct_url"
					label="Direct URL (optional)"
				/>
				<CreatableSelect
					control={form.control}
					name="scopes"
					placeholder="Type something and press enter..."
					label="Scopes (optional)"
				/>
			</div>
			<Button loading={mutation.isLoading} type="submit">
				Add Provider
			</Button>
		</Form>
	)
}

function CallbackUrls({
	projectName,
	providerName,
}: {
	projectName: string
	providerName: string
}) {
	const projectQuery = useQuery(QueryKey.GetProject, () => getProject(projectName ?? ''), {
		enabled: !!projectName,
	})
	const projectTag = projectQuery.data?.data?.tag ?? ''
	const profileQuery = useQuery(
		[QueryKey.GetProfile, projectTag],
		() => getProfile({ projectTag }),
		{ enabled: !!projectTag }
	)
	const accountId = profileQuery.data?.data.account_id

	return (
		<div className="space-y-3 text-xs">
			<p className="font-medium">
				Callback urls (these urls are used when creating an OAuth application):
			</p>
			<Url
				title="For user management"
				url={`${API_URL}/user/management/project/${projectTag}/provider/${providerName}/callback`}
			/>
			<Url
				title="For creating integration"
				url={`${API_URL}/oauth/user/provider/integration/callbacks/provider/${providerName}/account_id/${accountId}`}
			/>
		</div>
	)
}

export function Url({ title, url }: { title: string; url: string }) {
	const clipboard = useClipboard({ timeout: 3000 })

	return (
		<p className="flex flex-col gap-1">
			<div className="font-medium">{title}:</div>
			<div className="flex items-center justify-between gap-1">
				<Code>{url}</Code>
				<ActionIcon type="button" onClick={() => clipboard.copy(url)}>
					{clipboard.copied ? <IoCheckmark /> : <IoCopy />}
				</ActionIcon>
			</div>
		</p>
	)
}
