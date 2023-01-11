import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { addColumn, AddColumnRequest, QueryKey } from '../../api'
import { columnTypeOptions } from '../../constants'
import { useModal } from '../hooks'
import { Field, Form, NewSelect } from '../ui'

const schema = z.object({
	columnName: z.string().min(1, 'Name is required.'),
	columnType: z.string().min(1, 'Type is required.'),
})

type Schema = z.infer<typeof schema>

export function ColumnForm({ projectName, tableName }: { projectName: string; tableName: string }) {
	const modal = useModal()
	const client = useQueryClient()
	const form = useForm<Schema>({
		defaultValues: { columnName: '', columnType: '' },
		resolver: zodResolver(schema),
	})
	const mutation = useMutation(
		(payload: AddColumnRequest) => addColumn(projectName, tableName, payload),
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetColumns)
				modal.close()
			},
		}
	)
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="flex flex-col gap-5 grow">
				<Field
					control={form.control}
					errors={form.formState.errors}
					name="columnName"
					label="Name"
					placeholder="Column name"
				/>
				<NewSelect
					control={form.control}
					errors={form.formState.errors}
					name="columnType"
					label="Type"
					placeholder="Column type"
					options={columnTypeOptions}
				/>
			</div>
			<Button type="submit" loading={mutation.isLoading}>
				Add Column
			</Button>
		</Form>
	)
}
