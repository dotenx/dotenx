import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { z } from 'zod'
import { createProvider, getIntegrationKinds, QueryKey } from '../../api'
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
	scopes: z.array(z.string().min(1)),
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
		defaultValues: { name: '', type: '', key: '', secret: '', scopes: [], front_end_url: '' },
		resolver: zodResolver(schema),
	})
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))
	const integrationKindOptions = integrationTypesQuery.data?.data
		.filter((integration) => !!integration.oauth_provider)
		.map((integration) => integration.type)
		.map(toOption)

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
				<CreatableSelect
					control={form.control}
					name="scopes"
					placeholder="Type something and press enter..."
					label="Scopes"
				/>
			</div>
			<Button loading={mutation.isLoading} type="submit">
				Add Provider
			</Button>
		</Form>
	)
}
