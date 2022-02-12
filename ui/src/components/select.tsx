import { Interpolation, Theme } from '@emotion/react'
import { Control, Controller, FieldErrors, useController } from 'react-hook-form'
import ReactSelect, { MultiValue } from 'react-select'
import { FieldError } from './field'

export interface Option {
	label: string
	value: unknown
}

interface SelectProps {
	label?: string
	errors?: FieldErrors
	name: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	options?: Option[]
	isMulti?: boolean
	css?: Interpolation<Theme>
	placeholder?: string
	isLoading?: boolean
}

export function Select({
	label,
	errors,
	name,
	control,
	options = [],
	isMulti = false,
	placeholder,
	isLoading,
	...rest
}: SelectProps) {
	const {
		fieldState: { error },
	} = useController({ name: name, control })

	return (
		<div css={{ display: 'flex', flexDirection: 'column', gap: 2 }} {...rest}>
			<label
				htmlFor={name}
				css={[{ fontSize: 14 }, (theme) => error && { color: theme.color.negative }]}
			>
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

interface SelectControllerProps {
	name: string
	control: Control
	options: Option[]
	isMulti: boolean
	placeholder?: string
	isLoading?: boolean
}

function SelectController({
	control,
	name,
	options,
	isMulti,
	placeholder,
	isLoading,
}: SelectControllerProps) {
	return (
		<Controller
			control={control}
			name={name}
			defaultValue={isMulti ? [] : ''} // This is a bit tricky, maybe needs to change for different value types in future
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
								? getSelectedOptions(options, value)
								: options.find((option) => option.value === value)
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
