import { ActionIcon, Button } from '@mantine/core'
import { ReactNode } from 'react'
import { Control, useFieldArray, useForm } from 'react-hook-form'
import { IoAdd, IoTrash } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { z } from 'zod'
import { getColumns, QueryKey } from '../../api'
import { chainedConditionOptions, columnTypeKinds, operatorOptions } from '../../constants'
import { Field, NewSelect, Option } from '../ui'

const schema = z.object({
	conjunction: z.enum(['and', 'or']),
	filterSet: z.array(
		z.object({
			key: z.string(),
			operator: z.string(),
			value: z.string(),
		})
	),
})

export type QueryBuilderValues = z.infer<typeof schema>

interface QueryBuilderProps {
	projectName: string
	tableName: string
	children: (values: QueryBuilderValues) => ReactNode
	defaultValues?: QueryBuilderValues
}

export function QueryBuilder({
	projectName,
	tableName,
	children,
	defaultValues = { filterSet: [{ key: '', operator: '', value: '' }], conjunction: 'and' },
}: QueryBuilderProps) {
	const query = useQuery(QueryKey.GetColumns, () => getColumns(projectName, tableName))
	const form = useForm<QueryBuilderValues>({ defaultValues })
	const fieldArray = useFieldArray({ control: form.control, name: 'filterSet' })
	const conjunction = form.watch('conjunction')
	const filterSet = form.watch('filterSet')
	const columns = query.data?.data?.columns ?? []
	const columnOptions = columns.map((column) => ({
		label: column.name,
		value: column.name,
	}))
	const addCondition = () => fieldArray.append({ key: '', operator: '', value: '' })

	return (
		<div className="space-y-10">
			<div className="p-4 border rounded">
				<Title />
				{fieldArray.fields.length === 0 && <EmptyMessage />}
				<div className="mt-6 space-y-4">
					{fieldArray.fields.map((field, index) => (
						<ConditionRow
							key={field.id}
							columnOptions={columnOptions}
							columnType={
								columns.find((column) => column.name === filterSet[index].key)
									?.type ?? 'none'
							}
							conjunction={conjunction}
							control={form.control}
							index={index}
							loading={query.isLoading}
							onDelete={() => fieldArray.remove(index)}
						/>
					))}
				</div>
				<AddButton onClick={addCondition} />
			</div>
			{children(form.watch())}
		</div>
	)
}

function ConditionRow({
	index,
	control,
	columnOptions,
	loading,
	onDelete,
	conjunction,
	columnType,
}: {
	index: number
	control: Control<QueryBuilderValues>
	columnOptions: Option[]
	loading: boolean
	onDelete: () => void
	conjunction: string
	columnType: string
}) {
	const colKind = columnTypeKinds.find((kind) => kind.types.includes(columnType))?.kind ?? 'none'
	const colOperatorOptions = operatorOptions[colKind]

	return (
		<div className="grid items-center grid-cols-12 gap-2 px-4">
			<div className="col-span-">
				{index === 0 && <p className="pl-2">Where</p>}
				{index === 1 && (
					<NewSelect
						name={`conjunction`}
						options={chainedConditionOptions}
						control={control}
					/>
				)}
				{index > 1 && <p className="pl-2">{conjunction}</p>}
			</div>
			<div className="col-span-3">
				<NewSelect
					name={`filterSet.${index}.key`}
					placeholder="column"
					options={columnOptions}
					loading={loading}
					control={control}
				/>
			</div>
			<div className="col-span-3">
				<NewSelect
					name={`filterSet.${index}.operator`}
					placeholder="operator"
					options={colOperatorOptions}
					control={control}
				/>
			</div>
			<div className="flex items-center col-span-5 gap-2">
				<div className="grow">
					<Field
						name={`filterSet.${index}.value`}
						placeholder="value"
						control={control}
					/>
				</div>
				<DeleteButton onClick={onDelete} />
			</div>
		</div>
	)
}

function Title() {
	return <p>Select records from this table</p>
}

function EmptyMessage() {
	return (
		<p className="mt-[18px] text-xs text-slate-500">
			No filter condition are applied to this table
		</p>
	)
}

function DeleteButton({ onClick }: { onClick: () => void }) {
	return (
		<ActionIcon type="button" onClick={onClick}>
			<IoTrash />
		</ActionIcon>
	)
}

function AddButton({ onClick }: { onClick: () => void }) {
	return (
		<Button leftIcon={<IoAdd />} className="mt-6" type="button" onClick={onClick}>
			Add condition
		</Button>
	)
}
