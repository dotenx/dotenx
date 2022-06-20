import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { createProject, QueryKey } from '../../api'
import { useModal } from '../hooks'
import { Button, Field, Form } from '../ui'

const schema = z.object({
	name: z.string().min(1),
	description: z.string(),
})

type Schema = z.infer<typeof schema>

export function ProjectForm() {
	const modal = useModal()
	const client = useQueryClient()
	const form = useForm<Schema>({
		defaultValues: { name: '', description: '' },
		resolver: zodResolver(schema),
	})
	const mutation = useMutation(createProject, {
		onSuccess: () => {
			client.invalidateQueries(QueryKey.GetProjects)
			modal.close()
		},
	})
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

	return (
		<Form onSubmit={onSubmit}>
			<div className="flex flex-col gap-5">
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="name"
					label="Name"
					placeholder="Project name"
				/>
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="description"
					label="Description"
					placeholder="Project description"
				/>
			</div>
			<Button type="submit" loading={mutation.isLoading}>
				Create Project
			</Button>
		</Form>
	)
}
