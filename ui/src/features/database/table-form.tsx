import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { createTable, CreateTableRequest, QueryKey } from '../../api'
import { useModal } from '../hooks'
import { Button, Field, Form } from '../ui'

const schema = z.object({
	tableName: z.string().min(1),
})

type Schema = z.infer<typeof schema>

export function TableForm({ projectName }: { projectName: string }) {
	const client = useQueryClient()
	const modal = useModal()
	const form = useForm<Schema>({
		defaultValues: { tableName: '' },
		resolver: zodResolver(schema),
	})
	const mutation = useMutation(
		(payload: CreateTableRequest) => createTable(projectName, payload),
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetTables)
				modal.close()
			},
		}
	)
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

	return (
		<Form className="gap-16" onSubmit={onSubmit}>
			<Field
				control={form.control}
				errors={form.formState.errors}
				name="tableName"
				label="Name"
				placeholder="Table name"
			/>

			<Button type="submit" loading={mutation.isLoading}>
				Create Table
			</Button>
		</Form>
	)
}
