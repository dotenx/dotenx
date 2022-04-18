import clsx from 'clsx'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { IoChevronDown, IoSearch } from 'react-icons/io5'
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
		<div className="flex flex-col gap-1">
			<span className="text-sm font-bold cursor-default">Type</span>
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
				className={clsx(
					'flex items-center justify-between w-full px-2 py-1 text-left bg-white border rounded-lg cursor-pointer outline-rose-500 border-slate-400',
					isOpen && 'outline outline-offset-[-1px] outline-2'
				)}
				type="button"
				onClick={() => setIsOpen((isOpen) => !isOpen)}
			>
				{value ? (
					<div className="flex items-center gap-2">
						{value.iconUrl && <img className="w-5 h-5" src={value.iconUrl} alt="" />}
						{value.label}
					</div>
				) : (
					<span className="text-slate-500">{placeholder}</span>
				)}
				<IoChevronDown className="text-slate-400" />
			</button>

			{isOpen && (
				<div className="absolute left-0 right-0 z-10 flex flex-col pr-1 mt-1 overflow-y-auto bg-white border rounded-lg shadow-md border-slate-300 max-h-96 scrollbar-thumb-slate-300 scrollbar-track-slate-100 scrollbar-thin">
					<div className="flex items-center gap-3 px-2 py-1.5 m-2 border rounded-md">
						<IoSearch className="text-slate-500" />
						<input
							type="text"
							className="p-0 m-0 text-sm border-none rounded focus:ring-0 focus:outline-none placeholder:text-slate-500"
							placeholder="Search a task"
							onChange={(e) => setSearchText(e.target.value)}
							value={searchText}
							autoFocus
						/>
					</div>
					{searchedOptions.map(({ item, refIndex }) => (
						<div className="p-1" key={refIndex}>
							<div className="pl-1 text-sm text-gray-500">{item.group}</div>
							{item.options.map((option, index) => (
								<button
									key={index}
									className="flex items-center w-full gap-2 p-1 transition bg-white rounded-md cursor-pointer hover:bg-rose-50"
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
						</div>
					))}
				</div>
			)}
		</div>
	)
}
