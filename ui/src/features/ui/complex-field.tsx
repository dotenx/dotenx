import { Button } from '@mantine/core'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
	useForm,
} from 'react-hook-form'
import { IoClose } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { getFormatterFunctions, QueryKey } from '../../api'
import { Description } from './description'
import { FieldError } from './field'
import {
	GroupData,
	InputOrSelect,
	InputOrSelectKind,
	InputOrSelectRaw,
	InputOrSelectRawProps,
	InputOrSelectValue,
	SelectValue,
} from './input-or-select'
import { NewSelect } from './new-select'

export type ComplexFieldValue = InputOrSelectValue | FormattedValue

interface FormattedValue {
	fn: string
	args: InputOrSelectValue[]
}

export interface ComplexFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	groups: GroupData[]
	errors: FieldErrors<TFieldValues>
	placeholder?: string
}

export function ComplexField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ control, errors, groups, name, label, placeholder }: ComplexFieldProps<TFieldValues, TName>) {
	return (
		<div className="w-full">
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value } }) => (
					<ComplexFieldRaw
						onChange={onChange}
						value={value ?? { type: InputOrSelectKind.Text, data: '' }}
						label={label}
						name={name}
						groups={groups}
						placeholder={placeholder}
					/>
				)}
			/>
			<FieldError errors={errors} name={name} />
		</div>
	)
}

interface ComplexFieldRawProps {
	value: ComplexFieldValue
	onChange: (value: ComplexFieldValue) => void
	name: string
	label?: string
	groups: GroupData[]
	placeholder?: string
}
function ComplexFieldRaw({
	value,
	onChange,
	groups,
	name,
	label,
	placeholder,
}: ComplexFieldRawProps) {
	const [view, setView] = useState<'input-or-select' | 'formatting' | 'formatted'>(
		'input-or-select'
	)

	const switchToText = () => setView('input-or-select')
	const switchToFormatter = () => setView('formatting')
	const switchToFormatted = (value: FormattedValue) => {
		onChange(value)
		setView('formatted')
	}
	const resetFormatter = () => {
		setView('input-or-select')
		onChange({ type: InputOrSelectKind.Text, data: '' })
	}

	return (
		<div>
			{view === 'input-or-select' && !isFnValue(value) && (
				<Formatter
					groups={groups}
					name={name}
					label={label}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onClickFormatter={switchToFormatter}
				/>
			)}
			{view === 'formatting' && (
				<FormatterFnForm
					onSubmit={switchToFormatted}
					onCancel={switchToText}
					groups={groups}
				/>
			)}
			{(view === 'formatted' || isFnValue(value)) && (
				<FormattedBox label={label} value={value} onClose={resetFormatter} />
			)}
		</div>
	)
}

interface FormatterProps extends InputOrSelectRawProps {
	onClickFormatter: () => void
}

function Formatter({ onClickFormatter, ...rest }: FormatterProps) {
	return (
		<div className="flex gap-2">
			<InputOrSelectRaw {...rest} />
			{rest.value.type === InputOrSelectKind.Text && (
				<button
					className="w-6 h-6 italic font-bold bg-gray-100 hover:bg-gray-200 transition rounded mt-[29px] shrink-0"
					type="button"
					onClick={onClickFormatter}
				>
					f
				</button>
			)}
		</div>
	)
}

interface FormatterFnFormProps {
	onSubmit: (values: FormattedValue) => void
	onCancel: () => void
	groups: GroupData[]
}
function FormatterFnForm({ onSubmit, onCancel, groups }: FormatterFnFormProps) {
	const form = useForm<FormattedValue>({ defaultValues: { fn: '', args: [] } })
	const fnsQuery = useQuery(QueryKey.GetFormatterFunctions, getFormatterFunctions)
	const options = _.entries(fnsQuery.data?.data).map(([key]) => ({
		label: key,
		value: key,
	}))
	const selectedFn = form.watch('fn')
	const selectedFnData = fnsQuery.data?.data[selectedFn]
	const args = selectedFnData?.inputs
	const { resetField } = form

	useEffect(() => {
		if (selectedFn) resetField('args')
	}, [resetField, selectedFn])

	return (
		<div className="flex flex-col gap-2 p-2 border rounded-md">
			<div>
				<NewSelect
					control={form.control}
					name="fn"
					errors={form.formState.errors}
					label="Function"
					options={options}
					placeholder="Select a function"
				/>
				<Description>{selectedFnData?.description}</Description>
			</div>
			<div>
				{args && <p className="text-sm font-bold">Arguments</p>}
				<div className="flex flex-col gap-2 mt-1.5">
					{args?.map((_, index) => (
						<InputOrSelect
							groups={groups}
							key={index}
							control={form.control}
							errors={form.formState.errors}
							name={`args.${index}`}
						/>
					))}
				</div>
			</div>
			<div className="flex gap-4">
				<Button variant="outline" type="button" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="button" onClick={form.handleSubmit(onSubmit)}>
					Add Formatter
				</Button>
			</div>
		</div>
	)
}

interface FormattedValueProps {
	value: ComplexFieldValue
	onClose: () => void
	label?: string
}
function FormattedBox({ value, onClose, label }: FormattedValueProps) {
	if (!value || !isFnValue(value)) return null

	const args = value.args.map((arg, index) =>
		arg.type === InputOrSelectKind.Text ? (
			<span key={index}>
				{`"${arg.data}"`}
				{index !== value.args.length - 1 ? ',' : ''}
			</span>
		) : (
			<span key={index} className="flex">
				<FormattedOutput value={arg} />
				{index !== value.args.length - 1 ? ',' : ''}
			</span>
		)
	)

	return (
		<div className="flex flex-col gap-1">
			{label && <div className="text-sm font-bold">{label}</div>}
			<div className="flex items-center justify-between p-1 border rounded-lg border-slate-400">
				<div className="bg-gray-800 text-white px-1.5 rounded flex self-stretch items-center">
					<span className="flex font-mono text-xs font-black">
						{value.fn}(<div className="flex gap-1">{args}</div>)
					</span>
				</div>
				<button
					className="p-0.5 text-lg transition rounded-md text-rose-500 hover:bg-rose-50"
					onClick={onClose}
				>
					<IoClose />
				</button>
			</div>
		</div>
	)
}

function isFnValue(value: ComplexFieldValue): value is FormattedValue {
	return 'fn' in value
}

function FormattedOutput({ value }: { value: SelectValue }) {
	return (
		<span className="flex items-center gap-2 px-1 py-px rounded bg-gray-50 text-slate-700">
			{value.iconUrl && <img className="w-4 h-4" src={value.iconUrl} alt="" />}
			<span className="font-medium">{value.groupName}</span>
			<span>{value.data}</span>
		</span>
	)
}
