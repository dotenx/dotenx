import _ from 'lodash'
import { useEffect, useState } from 'react'
import { Control, Controller, FieldErrors, useForm } from 'react-hook-form'
import { IoClose } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { getFormatterFunctions, QueryKey } from '../../api'
import { Button } from './button'
import { Description } from './description'
import { Field, FieldError } from './field'
import {
	GroupData,
	InputOrSelectKind,
	InputOrSelectRaw,
	InputOrSelectRawProps,
	InputOrSelectValue,
} from './input-or-select'
import { NewSelect } from './new-select'

export type ComplexFieldValue = InputOrSelectValue | FormattedValue

interface FormattedValue {
	fn: string
	args: string[]
}

export interface ComplexFieldProps {
	name: string
	label?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	groups: GroupData[]
	errors: FieldErrors
	placeholder?: string
}
export function ComplexField({
	control,
	errors,
	groups,
	name,
	label,
	placeholder,
}: ComplexFieldProps) {
	return (
		<div className="w-full">
			<Controller
				control={control}
				name={name}
				defaultValue={{ type: 'text', data: '' }}
				render={({ field: { onChange, value } }) => (
					<ComplexFieldRaw
						onChange={onChange}
						value={value}
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

	console.log(value)

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
				<FormatterFnForm onSubmit={switchToFormatted} onCancel={switchToText} />
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
}
function FormatterFnForm({ onSubmit, onCancel }: FormatterFnFormProps) {
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
						<Field
							key={index}
							control={form.control}
							errors={form.formState.errors}
							name={`args.${index}`}
						/>
					))}
				</div>
			</div>
			<div className="flex gap-4">
				<Button variant="outlined" type="button" onClick={onCancel}>
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

	return (
		<div className="flex flex-col gap-1">
			{label && <div className="text-sm font-bold">{label}</div>}
			<div className="flex items-center justify-between p-1 border rounded-lg border-slate-400">
				<div className="bg-gray-800 text-white px-1.5 rounded flex self-stretch items-center">
					<span className="font-mono text-xs font-black">
						{value.fn}({value.args.map((arg) => `"${arg}"`).join(', ')})
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
