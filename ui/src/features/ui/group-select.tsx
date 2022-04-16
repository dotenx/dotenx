import Fuse from 'fuse.js'
import { Fragment, useMemo, useState } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { BsChevronDown } from 'react-icons/bs'
import { FieldError } from './field'

export interface GroupSelectOption {
	value: string
	label: string
	iconUrl?: string
}

interface GroupSelectProps {
	name: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	options: GroupOption[]
	errors?: FieldErrors
	placeholder: string
}

export function GroupSelect({ control, name, options, errors, placeholder }: GroupSelectProps) {
	return (
		<div className="flex flex-col gap-0.5">
			<span>Type</span>
			<ControlledGroupSelect
				name={name}
				control={control}
				options={options}
				placeholder={placeholder}
			/>
			{name && errors && <FieldError errors={errors} name={name} />}
		</div>
	)
}

export function ControlledGroupSelect({ control, name, options, placeholder }: GroupSelectProps) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value }, fieldState: { invalid } }) => {
				return (
					<GroupSelectInner
						onChange={(newValue) => onChange(newValue.value)}
						value={options
							.map((group) => group.options)
							.flat()
							.find((option) => option.value === value)}
						options={options}
						invalid={invalid}
						placeholder={placeholder}
					/>
				)
			}}
		/>
	)
}

interface GroupOption {
	group: string
	options: GroupSelectOption[]
}

interface GroupSelectInnerProps {
	value?: GroupSelectOption
	onChange: (value: GroupSelectOption) => void
	options: GroupOption[]
	invalid: boolean
	placeholder: string
}

function GroupSelectInner({ value, onChange, options, placeholder }: GroupSelectInnerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [searchText, setSearchText] = useState('')
	const fuse = useMemo(() => new Fuse(options, { keys: ['group', 'options.label'] }), [options])
	const searchedOptions = useMemo(() => {
		const result = fuse.search(searchText)
		if (result.length > 0) return result
		return options.map((option, index) => ({ item: option, refIndex: index }))
	}, [fuse, options, searchText])

	return (
		<div className="relative">
			<button
				className="flex items-center justify-between w-full p-1 text-left bg-white border border-black rounded cursor-pointer"
				type="button"
				onClick={() => setIsOpen((isOpen) => !isOpen)}
			>
				{value ? (
					<div className="flex items-center gap-2">
						{value.iconUrl && <img className="w-5 h-5" src={value.iconUrl} alt="" />}
						{value.label}
					</div>
				) : (
					<span>{placeholder}</span>
				)}
				<BsChevronDown />
			</button>

			{isOpen && (
				<div className="absolute left-0 right-0 z-10 flex flex-col mt-6 overflow-y-auto bg-white border border-black rounded max-h-96 scrollbar-thumb-gray-900 scrollbar-track-gray-100 scrollbar-thin">
					<input
						type="text"
						className="px-2 py-1 m-0 mt-1 text-sm border-none rounded focus:ring-0 "
						placeholder="Search a task"
						onChange={(e) => setSearchText(e.target.value)}
						value={searchText}
						autoFocus
					/>
					<hr className="m-1" />
					{searchedOptions.map(({ item, refIndex }) => (
						<Fragment key={refIndex}>
							<div className="pt-3 pl-1 text-sm text-gray-500">{item.group}</div>
							{item.options.map((option, index) => (
								<button
									key={index}
									className="p-1.5 flex bg-white w-full cursor-pointer items-center gap-2 hover:bg-black hover:text-white"
									type="button"
									onClick={() => {
										onChange(option)
										setIsOpen(false)
									}}
								>
									{option.iconUrl && (
										<img className="w-5 h-5" src={option.iconUrl} alt="" />
									)}
									{option.label}
								</button>
							))}
						</Fragment>
					))}
				</div>
			)}
		</div>
	)
}
