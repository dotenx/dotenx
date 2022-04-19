import clsx from 'clsx'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { IoChevronDown, IoClose } from 'react-icons/io5'
import { FieldError } from './field'

interface InputOrSelectProps {
	name: string
	label: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
	groups: GroupData[]
	errors: FieldErrors
}

export function InputOrSelect({ control, label, name, groups, errors }: InputOrSelectProps) {
	return (
		<div>
			<Controller
				control={control}
				name={name}
				defaultValue={{ type: 'text', data: '' }}
				render={({ field: { onChange, value } }) => (
					<InputOrSelectRaw
						onChange={onChange}
						value={value}
						label={label}
						name={name}
						groups={groups}
					/>
				)}
			/>
			<FieldError errors={errors} name={name} />
		</div>
	)
}

export interface GroupData {
	name: string
	options: string[]
	iconUrl?: string
}

export interface InputOrSelectValue {
	type: 'text' | 'option'
	data: string
	groupName?: string
	iconUrl?: string
}

interface InputOrSelectRawProps {
	name: string
	label: string
	groups: GroupData[]
	value: InputOrSelectValue
	onChange: (value: InputOrSelectValue) => void
}

function InputOrSelectRaw({ name, groups, value, onChange, label }: InputOrSelectRawProps) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const close = useCallback(() => setIsOpen(false), [])
	useOutsideClick(wrapperRef, close)
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="relative" ref={wrapperRef}>
			<div className="flex flex-col gap-1">
				<label className="text-sm font-bold" htmlFor={name}>
					{label}
				</label>
				{value.type === 'option' && (
					<SelectedData
						value={value}
						onClose={() =>
							onChange({
								type: 'text',
								data: '',
							})
						}
					/>
				)}
				{value.type === 'text' && (
					<input
						className={clsx(
							'px-2 py-1 border rounded-lg border-slate-400 outline-rose-500',
							isOpen && 'outline-2 outline-offset-[-0.5px]'
						)}
						onFocus={() => setIsOpen(true)}
						id={name}
						autoComplete="off"
						name="name"
						value={value.data}
						onChange={(e) => onChange({ type: 'text', data: e.target.value })}
					/>
				)}
			</div>
			{isOpen && groups.length !== 0 && (
				<div className="absolute border border-slate-300 rounded-lg mt-1 left-0 right-0 p-2 flex flex-col gap-1.5 bg-white z-10 shadow-md select-none">
					{groups.map((group, index) => (
						<Group
							key={index}
							name={group.name}
							options={group.options}
							iconUrl={group.iconUrl}
							onSelect={(value) => {
								onChange({
									type: 'option',
									data: value,
									groupName: group.name,
									iconUrl: group.iconUrl,
								})
								setIsOpen(false)
							}}
						/>
					))}
				</div>
			)}
		</div>
	)
}

interface GroupProps {
	name: string
	options: string[]
	onSelect: (value: string) => void
	iconUrl?: string
}

function Group({ name, options, onSelect, iconUrl }: GroupProps) {
	const [isOpen, setIsOpen] = useState(false)

	if (options.length === 0) return null

	return (
		<div className="p-1" tabIndex={0}>
			<div
				className="flex items-center justify-between font-medium bg-white border-none rounded cursor-pointer"
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="flex items-center gap-1.5">
					{iconUrl && <img className="w-4 h-4" src={iconUrl} alt="" />}
					<span>{name}</span>
				</div>
				<IoChevronDown
					className={clsx('text-slate-400 transition', isOpen && '-scale-y-100')}
				/>
			</div>
			{isOpen && (
				<div className="flex flex-col gap-1 mt-1">
					{options.map((option, index) => (
						<div
							key={index}
							className="text-sm rounded-md py-0.5 px-1.5 cursor-pointer transition hover:bg-rose-50"
							onClick={() => onSelect(option)}
						>
							{option}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

interface SelectedDataProps {
	value: InputOrSelectValue
	onClose: () => void
}

function SelectedData({ value, onClose }: SelectedDataProps) {
	return (
		<div className="flex items-center justify-between p-1 border rounded-lg border-slate-400">
			<div className="bg-gray-50 px-1.5 flex items-center gap-2 rounded">
				{value.iconUrl && <img className="w-4 h-4" src={value.iconUrl} alt="" />}
				<span className="font-medium">{value.groupName}</span>
				<span>{value.data}</span>
			</div>
			<button
				className="p-0.5 text-lg transition rounded-md text-rose-500 hover:bg-rose-50"
				onClick={onClose}
			>
				<IoClose />
			</button>
		</div>
	)
}

function useOutsideClick(ref: RefObject<HTMLDivElement>, callback: () => void) {
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		function handleClickOutside(event: any) {
			if (ref.current && !ref.current.contains(event.target)) {
				callback()
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [callback, ref])
}
