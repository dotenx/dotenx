import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { z } from 'zod'
import { addColumn, AddColumnRequest, QueryKey } from '../../api'
import { useModal } from '../hooks'
import { Button, Field, Form, NewSelect } from '../ui'

const schema = z.object({
	columnName: z.string().min(1),
	columnType: z.string().min(1),
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
				client.invalidateQueries(QueryKey.GetTable)
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

const columnTypeOptions = [
	{ label: 'Yes/No', value: 'yes_no' },
	{ label: 'Image address', value: 'image_address' },
	{ label: 'File address', value: 'file_address' },
	{ label: 'Rating', value: 'rating' },
	{ label: 'URL', value: 'url' },
	{ label: 'Email', value: 'email' },
	{ label: 'Time', value: 'just_time' },
	{ label: 'Date', value: 'just_date' },
	{ label: 'Date time', value: 'date_time' },
	{ label: 'Number', value: 'num' },
	{ label: 'Short text', value: 'short_text' },
	{ label: 'Long text', value: 'long_text' },
	{ label: 'Link', value: 'link_filed' },
]
