import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'
import ReactSelect, { MultiValue } from 'react-select'
import { FieldError } from './field'

export interface Option {
	label: string
	value: unknown
}

interface SelectProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	label?: string
	errors?: FieldErrors<TFieldValues>
	options?: Option[]
	isMulti?: boolean
	placeholder?: string
	isLoading?: boolean
}

export function Select<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	label,
	errors,
	name,
	control,
	options = [],
	isMulti = false,
	placeholder,
	isLoading,
	...rest
}: SelectProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-0.5" {...rest}>
			<label htmlFor={name} className="text-sm">
				{label}
			</label>
			<SelectController
				name={name}
				control={control}
				options={options}
				isMulti={isMulti}
				placeholder={placeholder}
				isLoading={isLoading}
			/>
			{name && errors && <FieldError errors={errors} name={name} />}
		</div>
	)
}

const defaultValue = { label: '', value: '' }

function SelectController<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	control,
	name,
	options,
	isMulti,
	placeholder,
	isLoading,
}: SelectProps<TFieldValues, TName>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => {
				return (
					<ReactSelect
						onChange={(newValue) =>
							onChange(
								isMulti
									? (newValue as MultiValue<Option>).map((v) => v.value)
									: (newValue as Option)?.value
							)
						}
						value={
							isMulti
								? getSelectedOptions(options ?? [], value ?? [])
								: options?.find((option) => option.value === value) ?? defaultValue
						}
						options={options}
						id={name}
						isMulti={isMulti}
						placeholder={placeholder}
						isLoading={isLoading}
					/>
				)
			}}
		/>
	)
}

const getSelectedOptions = (options: Option[], values: unknown[]): Option[] =>
	options.filter((option) => values.some((val) => option.value === val))
