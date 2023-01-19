<<<<<<< HEAD
import { zodResolver } from '@hookform/resolvers/zod'
import { ActionIcon, Avatar, Button, Code, Group, Loader, Select, Text } from '@mantine/core'
import { useClipboard } from '@mantine/hooks'
import { forwardRef, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { IoCheckmark, IoCopy } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
=======
import { zodResolver } from "@hookform/resolvers/zod"
import { ActionIcon, Button, Code } from "@mantine/core"
import { useClipboard } from "@mantine/hooks"
import { useForm } from "react-hook-form"
import { IoCheckmark, IoCopy } from "react-icons/io5"
import { useMutation, useQuery, useQueryClient } from "react-query"
import { useParams } from "react-router-dom"
import { z } from "zod"
>>>>>>> main
import {
	API_URL,
	createProvider,
	getIntegrationKinds,
	GetIntegrationKindsResponse,
	getProfile,
	getProject,
	QueryKey,
<<<<<<< HEAD
} from '../../api'
import { AUTOMATION_PROJECT_NAME } from '../../pages/automation'
import { toOption } from '../../utils'
import { useModal } from '../hooks'
import { CreatableSelect, Field, Form } from '../ui'
=======
} from "../../api"
import { AUTOMATION_PROJECT_NAME } from "../../pages/automation"
import { toOption } from "../../utils"
import { useModal } from "../hooks"
import { CreatableSelect, Field, Form, NewSelect } from "../ui"
>>>>>>> main

const schema = z.object({
	name: z
		.string()
		.min(2)
		.max(20)
		.regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
			message:
				"Name should start with a letter and contain only letters, numbers, and underscores",
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
	const [newOptions, setNewOptions] = useState<any>()

	const hadnleSetValue = ({ data }: { data: GetIntegrationKindsResponse }) => {
		const integrationKindOptions = data
			.filter((integration) => !!integration.oauth_provider)
			.map((integration) => integration.type)
			.map(toOption)

		setNewOptions(
			integrationKindOptions?.map((o) => {
				const imageUrl = () => {
					switch (o.value) {
						case 'google':
							return 'https://files.dotenx.com/7e467928-5267-4bd2-8665-245028533690.png'
						case 'instagram':
							return 'https://files.dotenx.com/6651658e-c8d2-4593-8f1b-be107c692faf.png'
						case 'discord':
							return 'https://files.dotenx.com/819c2274-b428-413e-8531-fc36340de72c.png'
						case 'typeform':
							return 'https://files.dotenx.com/099cae2c-f0cd-43f7-93bb-db2603b29cbc.png'
						case 'dropbox':
							return 'https://files.dotenx.com/8c68c03a-5876-4a5d-b8a5-8158ca772c1c.png'
						case 'ebay':
							return 'https://files.dotenx.com/31a9e7bb-9655-40c4-9c3f-a85516ab6f3f.png'
						case 'facebook':
							return 'https://files.dotenx.com/ae4d36e6-afe0-45e3-8b9c-b9fd5d7ccd14.png'
						case 'slack-bot':
							return 'https://files.dotenx.com/6bf34bf3-a8ea-4547-97e4-9fab4fb71b95.png'
						case 'twitter':
							return 'https://files.dotenx.com/81fa98a7-50a0-426c-b6be-a5ba51e322ab.png'
						case 'mailchimp':
							return 'https://files.dotenx.com/171735e7-cf41-4405-83ea-310d1e4a33ef.png'
						default:
							return 'https://files.dotenx.com/4b613007-c386-4a10-8080-79a42c349a75.png'
					}
				}
				return { image: imageUrl(), ...o }
			})
		)
	}
	useQuery(QueryKey.GetIntegrationTypes, getIntegrationKinds, {
		onSuccess: (data) => {
			hadnleSetValue(data)
		},
	})
	const [typeValue, setTypeValue] = useState<any>()
	const mutation = useMutation(createProvider, {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetProviders)
			modal.close()
		},
	})
	const form = useForm<Schema>({
		defaultValues: {
			name: "",
			type: "",
			key: "",
			secret: "",
			scopes: [],
			front_end_url: "",
		},
		resolver: zodResolver(schema),
	})
	useEffect(() => {
		form.setValue('type', typeValue as string)
	}, [typeValue])

	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))
	const { projectName = AUTOMATION_PROJECT_NAME } = useParams()
	const providerName = form.watch("name")

	interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
		image: string
		label: string
		value: string
	}

	const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
		({ image, label, ...others }: ItemProps, ref) => (
			<div ref={ref} {...others}>
				<Group noWrap>
					<Avatar src={image} />

					<div>
						<Text size="md" className="capitalize font-semibold">
							{label}
						</Text>
					</div>
				</Group>
			</div>
		)
	)
	SelectItem.displayName = 'SelectItem'

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
				<Select
					styles={(theme) => ({
						item: {
							'&[data-selected]': {
								'&, &:hover': {
									backgroundColor:
										theme.colorScheme === 'dark'
											? theme.colors.dark[5]
											: theme.colors.dark[3],
									color: theme.colorScheme === 'dark' ? theme.white : theme.white,
								},
							},
						},
					})}
					onChange={setTypeValue}
					label="Type"
					placeholder="Provider kind"
					itemComponent={SelectItem}
					data={newOptions || []}
					maxDropdownHeight={400}
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
	const projectQuery = useQuery(QueryKey.GetProject, () => getProject(projectName ?? ""), {
		enabled: !!projectName,
	})
	const projectTag = projectQuery.data?.data?.tag ?? ""
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
