import { ActionIcon, Button, CloseButton, Menu, Textarea, TextInput } from '@mantine/core'
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
import {
	IoClose,
	IoCode,
	IoCodeWorking,
	IoEllipsisHorizontal,
	IoGitMerge,
	IoText,
} from 'react-icons/io5'
import { useQuery } from 'react-query'
import { getFormatterFunctions, QueryKey } from '../../api'
import { Description } from './description'
import { FieldError } from './field'
import {
	GroupData,
	InputOrSelectKind,
	InputOrSelectRaw,
	InputOrSelectRawProps,
	InputOrSelectValue,
	SelectValue,
} from './input-or-select'
import { NewSelect } from './new-select'

export type ComplexFieldValue =
	| InputOrSelectValue
	| FormattedValue
	| NestedValue
	| JsonValue
	| JsonArrayValue

export interface FormattedValue {
	fn: string
	args: InputOrSelectValue[]
}

export interface NestedValue {
	kind: 'nested'
	data: string
}

interface JsonValue {
	kind: 'json'
	data: string
}

interface JsonArrayValue {
	kind: 'json-array'
	data: string
}

export interface ComplexFieldProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	groups?: GroupData[]
	errors?: FieldErrors<TFieldValues>
	placeholder?: string
	valueKinds?: ('json' | 'json-array' | 'nested' | 'formatted' | 'input-or-select')[]
}

export function ComplexField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({
	control,
	errors,
	groups = [],
	name,
	label,
	placeholder,
	valueKinds,
}: ComplexFieldProps<TFieldValues, TName>) {
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
						valueKinds={valueKinds}
					/>
				)}
			/>
			{errors && <FieldError errors={errors} name={name} />}
		</div>
	)
}

interface ComplexFieldRawProps {
	value: ComplexFieldValue
	onChange: (value: ComplexFieldValue) => void
	name?: string
	label?: string
	groups?: GroupData[]
	placeholder?: string
	valueKinds?: ('json' | 'json-array' | 'nested' | 'formatted' | 'input-or-select')[]
}
export function ComplexFieldRaw({
	value,
	onChange,
	groups = [],
	name = '',
	label,
	placeholder,
	valueKinds = ['nested', 'formatted', 'input-or-select'],
}: ComplexFieldRawProps) {
	const [view, setView] = useState<
		'input-or-select' | 'formatting' | 'formatted' | 'nested' | 'json' | 'json-array'
	>('input-or-select')

	const switchToText = () => {
		setView('input-or-select')
		onChange({ type: InputOrSelectKind.Text, data: '' })
	}
	const switchToFormatter = () => setView('formatting')
	const switchToNested = () => {
		setView('nested')
		onChange({ kind: 'nested', data: '' })
	}
	const switchToJson = () => {
		setView('json')
		onChange({ kind: 'json', data: '' })
	}
	const switchToJsonArray = () => {
		setView('json-array')
		onChange({ kind: 'json-array', data: '' })
	}
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
			{view === 'input-or-select' && !isFnValue(value) && !('kind' in value) && (
				<Formatter
					groups={groups}
					name={name}
					label={label}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					onClickFormatter={switchToFormatter}
					onClickNested={switchToNested}
					onClickJson={switchToJson}
					onClickJsonArray={switchToJsonArray}
					valueKinds={valueKinds}
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
			{'kind' in value && value.kind === 'nested' && (
				<NestedValueInput
					name={name}
					label={label}
					placeholder={placeholder}
					value={value.data}
					switchToNormal={switchToText}
					onChange={(value) => onChange({ kind: 'nested', data: value })}
				/>
			)}
			{'kind' in value && value.kind === 'json' && (
				<JsonValueInput
					name={name}
					label={label}
					placeholder={placeholder}
					value={value.data}
					onChange={(value) => onChange({ kind: 'json', data: value })}
					switchToNormal={switchToText}
				/>
			)}
			{'kind' in value && value.kind === 'json-array' && (
				<JsonValueInput
					name={name}
					label={label}
					placeholder={placeholder}
					value={value.data}
					onChange={(value) => onChange({ kind: 'json-array', data: value })}
					switchToNormal={switchToText}
				/>
			)}
		</div>
	)
}

function JsonValueInput({
	switchToNormal,
	onChange,
	...rest
}: {
	name: string
	label?: string
	placeholder?: string
	value: string
	switchToNormal: () => void
	onChange: (value: string) => void
}) {
	return (
		<div className="flex gap-2">
			<Textarea
				{...rest}
				onChange={(event) => onChange(event.target.value)}
				className="grow"
			/>
			<CloseButton size="xs" onClick={switchToNormal} />
		</div>
	)
}

function NestedValueInput({
	switchToNormal,
	onChange,
	...rest
}: {
	name: string
	label?: string
	placeholder?: string
	value: string
	switchToNormal: () => void
	onChange: (value: string) => void
}) {
	return (
		<TextInput
			{...rest}
			rightSection={<CloseButton size="xs" onClick={switchToNormal} />}
			onChange={(event) => onChange(event.target.value)}
		/>
	)
}

interface FormatterProps extends InputOrSelectRawProps {
	onClickFormatter: () => void
	onClickNested: () => void
	onClickJson: () => void
	onClickJsonArray: () => void
	valueKinds: ('json' | 'json-array' | 'nested' | 'formatted' | 'input-or-select')[]
}

function Formatter({
	onClickFormatter,
	onClickNested,
	onClickJson,
	onClickJsonArray,
	valueKinds,
	...rest
}: FormatterProps) {
	return (
		<div className="flex items-center gap-2">
			<InputOrSelectRaw {...rest} />
			{rest.value.type === InputOrSelectKind.Text && (
				<Menu shadow="md" width={200}>
					<Menu.Target>
						<ActionIcon mt={rest.label ? 27 : 0}>
							<IoEllipsisHorizontal type="button" />
						</ActionIcon>
					</Menu.Target>

					<Menu.Dropdown>
						{valueKinds.includes('formatted') && (
							<Menu.Item icon={<IoText size={14} />} onClick={onClickFormatter}>
								Formatter
							</Menu.Item>
						)}
						{valueKinds.includes('nested') && (
							<Menu.Item icon={<IoGitMerge size={14} />} onClick={onClickNested}>
								Nested Value
							</Menu.Item>
						)}
						{valueKinds.includes('json') && (
							<Menu.Item icon={<IoCode size={14} />} onClick={onClickJson}>
								JSON
							</Menu.Item>
						)}
						{valueKinds.includes('json-array') && (
							<Menu.Item
								icon={<IoCodeWorking size={14} />}
								onClick={onClickJsonArray}
							>
								JSON Array
							</Menu.Item>
						)}
					</Menu.Dropdown>
				</Menu>

				// <button
				// 	className="w-6 h-6 italic font-bold bg-gray-100 hover:bg-gray-200 transition rounded mt-[29px] shrink-0"
				// 	type="button"
				// 	onClick={onClickFormatter}
				// >
				// 	f
				// </button>
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
				<div className="flex flex-col gap-2 mt-1.5">
					{args?.map((_, index) => (
						<ComplexField
							label="Arguments"
							groups={groups}
							key={index}
							control={form.control}
							errors={form.formState.errors}
							name={`args.${index}`}
							valueKinds={['nested', 'input-or-select']}
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
