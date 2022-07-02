import { ReactNode } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { IoTrash } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { z } from 'zod'
import { getColumns, QueryKey } from '../../api'
import { Field, NewSelect } from '../ui'

const chainedConditionOptions = [
	{ label: 'and', value: 'and' },
	{ label: 'or', value: 'or' },
]

const operatorOptions = {
	integer: [
		{ label: '=', value: '=' },
		{ label: '!=', value: '!=' },
		{ label: '>', value: '>' },
		{ label: '<', value: '<' },
		{ label: '>=', value: '>=' },
		{ label: '<=', value: '<=' },
	],
	'character varying': [
		{ label: 'is', value: '=' },
		{ label: 'is not', value: '!=' },
		{ label: 'contains', value: 'contains' },
		{ label: 'does not contain', value: 'doesNotContain' },
	],
	none: [],
}

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

export default function QueryBuilder({
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
						<div key={field.id} className="grid items-center grid-cols-12 gap-2 px-4">
							<div className="col-span-">
								{index === 0 && <p className="pl-2">Where</p>}
								{index === 1 && (
									<NewSelect
										name={`conjunction`}
										options={chainedConditionOptions}
										control={form.control}
									/>
								)}
								{index > 1 && <p className="pl-2">{conjunction}</p>}
							</div>
							<div className="col-span-3">
								<NewSelect
									name={`filterSet.${index}.key`}
									placeholder="column"
									options={columnOptions}
									loading={query.isLoading}
									control={form.control}
								/>
							</div>
							<div className="col-span-3">
								<NewSelect
									name={`filterSet.${index}.operator`}
									placeholder="operator"
									options={
										operatorOptions[
											columns.find(
												(column) => column.name === filterSet[index].key
											)?.type ?? 'none'
										]
									}
									control={form.control}
								/>
							</div>
							<div className="flex items-center col-span-5 gap-2">
								<div className="grow">
									<Field
										name={`filterSet.${index}.value`}
										placeholder="value"
										control={form.control}
									/>
								</div>
								<DeleteButton onClick={() => fieldArray.remove(index)} />
							</div>
						</div>
					))}
				</div>
				<AddButton onClick={addCondition} />
			</div>
			{children(form.watch())}
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
		<button
			className="p-2 transition rounded hover:bg-gray-50 place-self-start"
			type="button"
			onClick={onClick}
		>
			<IoTrash />
		</button>
	)
}

function AddButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			className="mt-6 font-semibold transition hover:text-slate-900 text-slate-600"
			type="button"
			onClick={onClick}
		>
			+ Add condition
		</button>
	)
}
