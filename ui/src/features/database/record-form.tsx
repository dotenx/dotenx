import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from 'react-query'
import { addRecord, AddRecordRequest, QueryKey } from '../../api'
import { useModal } from '../hooks'
import { Button, Field, Form } from '../ui'

export function RecordForm({
	columns,
	projectTag,
	tableName,
}: {
	columns: string[]
	projectTag: string
	tableName: string
}) {
	const form = useForm()
	const client = useQueryClient()
	const modal = useModal()
	const mutation = useMutation(
		(payload: AddRecordRequest) => addRecord(projectTag, tableName, payload),
		{
			onSuccess: () => {
				client.invalidateQueries(QueryKey.GetTableRecords)
				modal.close()
			},
		}
	)
	const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

	return (
		<Form className="h-full" onSubmit={onSubmit}>
			<div className="space-y-5 grow">
				{columns.map((column) => (
					<Field key={column} label={column} name={column} control={form.control} />
				))}
			</div>
			<Button type="submit" loading={mutation.isLoading}>
				Add Record
			</Button>
		</Form>
	)
}
