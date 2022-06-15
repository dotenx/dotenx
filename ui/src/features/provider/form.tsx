import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { createProvider, QueryKey } from '../../api'
import { useModal } from '../hooks'
import { Button, CreatableSelect, Field, Form } from '../ui'

const schema = z.object({
	name: z.string().min(1),
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

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="name"
					label="Name"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="type"
					label="Type"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="key"
					label="Key"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="secret"
					label="Secret"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="front_end_url"
					label="Front-end URL"
				/>
				<CreatableSelect
					control={form.control}
					name="scopes"
					placeholder="Type something and press enter..."
					label="Scopes"
				/>
			</div>
			<Button type="submit">Add</Button>
		</Form>
	)
}
