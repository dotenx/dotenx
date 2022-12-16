import clsx from 'clsx'
import Fuse from 'fuse.js'
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react'
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'
import { IoChevronDown, IoSearch } from 'react-icons/io5'
import { useOutsideClick } from '../hooks'
import { Fade } from './animation/fade'
import { FieldError } from './field'
import { Loader } from './loader'

export interface GroupSelectOption {
	value: string
	label: string
	iconUrl?: string
}

interface GroupSelectProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	options: GroupOption[]
	errors?: FieldErrors<TFieldValues>
	placeholder: string
	loading?: boolean
}

export function GroupSelect<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ control, name, options, errors, placeholder, loading }: GroupSelectProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm font-bold cursor-default">Type</span>
			<ControlledGroupSelect
				name={name}
				control={control}
				options={options}
				placeholder={placeholder}
				loading={loading}
			/>
			{name && errors && <FieldError errors={errors} name={name} />}
		</div>
	)
}

export function ControlledGroupSelect<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ control, name, options, placeholder, loading }: GroupSelectProps<TFieldValues, TName>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value }, fieldState: { invalid } }) => {
				return (
					<GroupSelectInner
						onChange={(newValue) => onChange(newValue.value)}
						value={
							options
								.map((group) => group.options)
								.flat()
								.find((option) => option.value === value) ?? {
								label: '',
								value: '',
							}
						}
						options={options}
						invalid={invalid}
						placeholder={placeholder}
						loading={loading}
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
	loading?: boolean
}

function GroupSelectInner({
	value,
	onChange,
	options,
	placeholder,
	loading,
}: GroupSelectInnerProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [searchText, setSearchText] = useState('')
	const [selectedGroup, setSelectedGroup] = useState<GroupOption>()
	const groupsSearch = useMemo(() => new Fuse(options, { keys: ['group'] }), [options])
	const itemOptions = useMemo(() => selectedGroup?.options ?? [], [selectedGroup?.options])
	const itemsSearch = useMemo(() => new Fuse(itemOptions, { keys: ['value'] }), [itemOptions])

	const searchedGroups = useMemo(() => {
		const result = groupsSearch.search(searchText)
		if (searchText) return result
		return options.map((option, index) => ({ item: option, refIndex: index }))
	}, [groupsSearch, options, searchText])

	const searchedItems = useMemo(() => {
		const result = itemsSearch.search(searchText)
		if (searchText) return result
		return itemOptions.map((option, index) => ({ item: option, refIndex: index }))
	}, [itemsSearch, itemOptions, searchText])

	const close = () => {
		setIsOpen(false)
		setSearchText('')
		setSelectedGroup(undefined)
	}

	const wrapperRef = useRef<HTMLDivElement>(null)
	useOutsideClick(wrapperRef, close)

	return (
		<div className="relative" ref={wrapperRef}>
			<button
				className={clsx(
					'flex items-center justify-between w-full px-2 py-1 text-left bg-white border rounded cursor-pointer outline-rose-500 border-slate-400',
					isOpen && 'outline outline-offset-[-1px] outline-2'
				)}
				type="button"
				onClick={() => (!isOpen ? setIsOpen(true) : close())}
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

			<div className="absolute left-0 right-0 z-10">
				<Fade isOpen={isOpen}>
					<OpenedMenu
						onChange={onChange}
						searchText={searchText}
						setSearchText={setSearchText}
						selectedGroup={selectedGroup}
						setSelectedGroup={setSelectedGroup}
						searchedGroups={searchedGroups}
						searchedItems={searchedItems}
						close={close}
						loading={loading}
					/>
				</Fade>
			</div>
		</div>
	)
}

interface OpenedMenuProps {
	onChange: (value: GroupSelectOption) => void
	searchText: string
	setSearchText: Dispatch<SetStateAction<string>>
	selectedGroup: GroupOption | undefined
	setSelectedGroup: Dispatch<SetStateAction<GroupOption | undefined>>
	searchedGroups: {
		item: GroupOption
		refIndex: number
	}[]
	searchedItems: {
		item: GroupSelectOption
		refIndex: number
	}[]
	close: () => void
	loading?: boolean
}

function OpenedMenu({
	close,
	onChange,
	searchText,
	searchedGroups,
	searchedItems,
	selectedGroup,
	setSearchText,
	setSelectedGroup,
	loading,
}: OpenedMenuProps) {
	const searchRef = useRef<HTMLInputElement>(null)

	return (
		<div className="flex flex-col pr-1 mt-1 overflow-y-auto bg-white border rounded shadow-md border-slate-300 max-h-96 scrollbar-thumb-slate-300 scrollbar-track-slate-100 scrollbar-thin">
			<div className="flex items-center gap-3 px-2 py-1.5 m-2 border rounded focus-within:bg-slate-50 transition">
				<IoSearch className="text-slate-500" />
				<input
					className="p-0 m-0 text-sm transition border-none rounded focus:ring-0 focus:outline-none focus:bg-slate-50 placeholder:text-slate-500"
					ref={searchRef}
					type="text"
					placeholder="Search a task"
					onChange={(e) => setSearchText(e.target.value)}
					value={searchText}
					autoFocus
				/>
			</div>
			<div className="pb-1">
				{loading && <Loader className="py-6" />}
				{!loading && !selectedGroup && searchedGroups.length === 0 && (
					<div className="pb-2 pt-1.5 text-xs font-thin text-center">No group found</div>
				)}
				{!selectedGroup &&
					searchedGroups.map(({ item, refIndex }) => (
						<div className="px-2 py-0.5" key={refIndex}>
							<DropdownItem
								key={refIndex}
								label={item.group}
								iconUrl={item.options[0].iconUrl}
								onSelect={() => {
									setSelectedGroup(item)
									setSearchText('')
									searchRef.current?.focus()
								}}
							/>
						</div>
					))}
				{selectedGroup && searchedItems.length === 0 && (
					<div className="pb-2 pt-1.5 text-xs font-thin text-center">No item found</div>
				)}
				{selectedGroup &&
					searchedItems.map(({ item, refIndex }) => (
						<div className="px-2 py-0.5" key={refIndex}>
							<DropdownItem
								label={item.label}
								iconUrl={item.iconUrl}
								onSelect={() => {
									onChange(item)
									close()
								}}
							/>
						</div>
					))}
			</div>
		</div>
	)
}
interface DropdownItemProps {
	onSelect: () => void
	iconUrl?: string
	label: string
}

function DropdownItem({ onSelect, iconUrl, label }: DropdownItemProps) {
	return (
		<button
			className="flex items-center w-full gap-2 p-2 text-sm transition bg-white rounded outline-none cursor-pointer hover:bg-rose-50 focus:bg-rose-50"
			type="button"
			onClick={onSelect}
		>
			{iconUrl && <img className="w-5 h-5" src={iconUrl} alt="" />}
			{label}
		</button>
	)
}
