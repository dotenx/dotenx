import { Button, Checkbox } from "@mantine/core"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "react-query"
import {
	addRecord,
	AddRecordRequest,
	QueryKey,
	TableRecord,
	updateRecord,
	UpdateRecordRequest,
} from "../../api"
import { useModal } from "../hooks"
import { CreatableSelect, Field, Form, Textarea } from "../ui"

export function RecordForm({
	columns,
	projectTag,
	tableName,
}: {
	columns: { name: string; type: string }[]
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
				{columns.map((column) =>
					column.type === "yes_no" ? (
						<Checkbox
							key={column.name}
							label={column.name}
							{...form.register(column.name)}
						/>
					) : column.type.includes("array") ? (
						<CreatableSelect
							key={column.name}
							control={form.control}
							name={column.name}
							label={column.name}
							placeholder=""
						/>
					) : column.type === "dtx_json" ? (
						<Textarea
							key={column.name}
							raw
							control={form.control}
							name={column.name}
							label={column.name}
						/>
					) : (
						<Field
							key={column.name}
							label={column.name}
							name={column.name}
							control={form.control}
						/>
					)
				)}
			</div>
			<Button type="submit" loading={mutation.isLoading}>
				Add Record
			</Button>
		</Form>
	)
}

export function EditRecordForm({
	columns,
	projectTag,
	tableName,
	rowId,
	defaultValues,
}: {
	columns: { name: string; type: string }[]
	projectTag: string
	tableName: string
	rowId: string
	defaultValues: TableRecord
}) {
	const form = useForm({ defaultValues })
	const client = useQueryClient()
	const modal = useModal()
	const mutation = useMutation(
		(payload: UpdateRecordRequest) => updateRecord(projectTag, tableName, rowId, payload),
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
				{columns.map((column) =>
					column.type === "yes_no" ? (
						<Checkbox
							key={column.name}
							label={column.name}
							{...form.register(column.name)}
						/>
					) : column.type.includes("array") ? (
						<CreatableSelect
							key={column.name}
							control={form.control}
							name={column.name}
							label={column.name}
							placeholder=""
						/>
					) : column.type === "dtx_json" ? (
						<Textarea
							key={column.name}
							raw
							control={form.control}
							name={column.name}
							label={column.name}
						/>
					) : (
						<Field
							key={column.name}
							label={column.name}
							name={column.name}
							control={form.control}
						/>
					)
				)}
			</div>
			<Button type="submit" loading={mutation.isLoading}>
				Update Record
			</Button>
		</Form>
	)
}
