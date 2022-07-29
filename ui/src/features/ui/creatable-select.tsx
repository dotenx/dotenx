import { KeyboardEventHandler, useState } from 'react'
import { Controller, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form'
import { OnChangeValue } from 'react-select'
import ReactCreatableSelect from 'react-select/creatable'

interface CreatableProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	placeholder: string
	label: string
}

export function CreatableSelect<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ control, name, placeholder, label }: CreatableProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={name} className="text-sm font-bold">
				{label}
			</label>
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value } }) => {
					return (
						<CreatableRaw
							onChange={onChange}
							value={value ?? []}
							placeholder={placeholder}
						/>
					)
				}}
			/>
		</div>
	)
}

const components = {
	DropdownIndicator: null,
}

interface CreatableRawProps {
	onChange: (newValue: string[]) => void
	value: string[]
	placeholder?: string
}
function CreatableRaw({ onChange, value, placeholder }: CreatableRawProps) {
	const [inputValue, setInputValue] = useState('')
	const handleInputChange = (newValue: string) => setInputValue(newValue)

	const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
		if (!inputValue) return
		switch (event.key) {
			case 'Enter':
			case 'Tab':
				onChange([...value, inputValue])
				setInputValue('')
				event.preventDefault()
		}
	}

	const handleChange = (value: OnChangeValue<{ label: string; value: string }, true>) => {
		onChange(value.map((value) => value.value))
	}

	return (
		<ReactCreatableSelect
			components={components}
			inputValue={inputValue}
			isClearable
			isMulti
			menuIsOpen={false}
			onChange={handleChange}
			onInputChange={handleInputChange}
			onKeyDown={handleKeyDown}
			placeholder={placeholder}
			value={value.map((value) => ({ label: value, value }))}
			styles={{
				control: (provided) => ({
					...provided,
					borderRadius: 8,
				}),
			}}
		/>
	)
}
