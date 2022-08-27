import { ActionIcon, Button } from '@mantine/core'
import { ReactNode } from 'react'
import { Control, useFieldArray } from 'react-hook-form'
import { IoAdd, IoTrash } from 'react-icons/io5'
import { z } from 'zod'
import { chainedConditionOptions, columnTypeKinds, operatorOptions } from '../../constants'
import { Field, NewSelect, Option } from '../ui'

const schema = z.object({
	conjunction: z.string(),
	filterSet: z.array(
		z
			.object({
				key: z.string(),
				operator: z.string(),
				value: z.string(),
			})
			.or(
				z.object({
					filterSet: z.array(
						z.object({
							key: z.string(),
							operator: z.string(),
							value: z.string(),
						})
					),
				})
			)
	),
})

export type QueryBuilderValues = z.infer<typeof schema>

interface QueryBuilderProps {
	name: string
	projectName: string
	tableName: string
	children: (values: QueryBuilderValues) => ReactNode
	defaultValues?: QueryBuilderValues
	form: any
	query: any
	index: number
	onDelete?: any
}

export function QueryBuilder({
	onDelete,
	form,
	query,
	name,
	projectName,
	tableName,
	children,
	index,
}: QueryBuilderProps) {
	const conjunction = form.watch(name + 'conjunction')
	const filterSet = form.watch(name + 'filterSet')
	const columns = query.data?.data?.columns ?? []
	const columnOptions = columns.map((column: any) => ({
		label: column.name,
		value: column.name,
	}))
	const fieldArray = useFieldArray({ control: form.control, name: name + 'filterSet' })

	const addCondition = () => fieldArray.append({ key: '', operator: '', value: '' })
	const addConditionGroup = () =>
		fieldArray.append({ filterSet: [{ key: '', operator: '', value: '' }], conjunction: 'and' })

	return (
		<div className="space-y-10">
			<div className="p-4 border rounded">
				<div className="flex justify-between">
					<Title />
					{onDelete && <DeleteButton onClick={() => onDelete()} />}
				</div>
				{fieldArray.fields.length === 0 && <EmptyMessage />}
				<div className="mt-6 space-y-4">
					<FieldsWrapper
						query={query}
						name={name}
						isLoading={query.isLoading}
						columns={columns}
						form={form}
						fieldArray={fieldArray}
						filterSet={filterSet}
						conjunction={conjunction}
						columnOptions={columnOptions}
						projectName={projectName}
						tableName={tableName}
					/>
				</div>
				<AddButton onClick={addCondition} title={'Add condition'} />
				<AddButton onClick={addConditionGroup} title={'Add condition group'} />
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
	name = '',
}: {
	name: string
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
			<div className="shrink-0">
				{index === 0 && <p className="pl-2 whitespace-nowrap">Where</p>}
				{index === 1 && (
					<NewSelect
						name={`${name}conjunction` as any}
						options={chainedConditionOptions}
						control={control}
					/>
				)}
				{index > 1 && <p className="pl-2 whitespace-nowrap">{conjunction}</p>}
			</div>
			<div className="col-span-3">
				<NewSelect
					name={`${name}filterSet.${index}.key` as any}
					placeholder="column"
					options={columnOptions}
					loading={loading}
					control={control}
				/>
			</div>
			<div className="col-span-3">
				<NewSelect
					name={`${name}filterSet.${index}.operator` as any}
					placeholder="operator"
					options={colOperatorOptions}
					control={control}
				/>
			</div>
			<div className="flex items-center col-span-5 gap-2">
				<div className="grow">
					<Field
						name={`${name}filterSet.${index}.value` as any}
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

function AddButton({ onClick, title }: { onClick: () => void; title: string }) {
	return (
		<Button leftIcon={<IoAdd />} className="mt-6 mr-2" type="button" onClick={onClick}>
			{title}
		</Button>
	)
}

function FieldsWrapper({
	fieldArray,
	conjunction,
	filterSet,
	columnOptions,
	columns,
	form,
	isLoading,
	projectName,
	tableName,
	name,
	query,
}: {
	query: any
	name: string
	fieldArray: any
	conjunction: any
	filterSet: any
	columnOptions: any
	columns: any
	form: any
	isLoading: boolean
	projectName: string
	tableName: string
}) {
	const filterSetItems = form.watch(`${name}filterSet`)
	return (
		<>
			{fieldArray.fields.map((field: any, index: any) => {
				if (!filterSet) return null
				const filterSetValue = filterSet[index]
				if (!filterSetValue) return null

				if ('filterSet' in filterSetValue) {
					return (
						<div className="flex gap-4">
							<div className="shrink-0">
								{index === 0 && <p className="pl-2 whitespace-nowrap">Where</p>}
								{index === 1 && (
									<NewSelect
										name={`${name}conjunction` as any}
										options={chainedConditionOptions}
										control={form.control}
									/>
								)}
								{index > 1 && (
									<p className="pl-2 whitespace-nowrap">{conjunction}</p>
								)}
							</div>
							<div className="grow">
								<QueryBuilder
									key={field.id}
									index={index}
									onDelete={() =>
										form.setValue(
											`${name}filterSet`,
											filterSetItems.filter(
												(item: any, i: number) => index !== i
											)
										)
									}
									form={form}
									query={query}
									name={`${name}filterSet.${index}.`}
									projectName={projectName}
									tableName={tableName}
								>
									{() => <div></div>}
								</QueryBuilder>
							</div>
						</div>
					)
				} else
					return (
						<ConditionRow
							name={name}
							key={field.id}
							columnOptions={columnOptions}
							columnType={
								columns.find((column: any) => column.name === filterSetValue.key)
									?.type ?? 'none'
							}
							conjunction={conjunction}
							control={form.control}
							index={index}
							loading={isLoading}
							onDelete={() => fieldArray.remove(index)}
						/>
					)
			})}
		</>
	)
}
