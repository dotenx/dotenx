import clsx from 'clsx'
import _ from 'lodash'
import { useCallback, useRef, useState } from 'react'
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'
import { IoChevronDown, IoClose } from 'react-icons/io5'
import { useOutsideClick } from '../hooks'
import { Fade } from './animation/fade'
import { FieldError } from './field'

export interface InputOrSelectProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	groups: GroupData[]
	errors?: FieldErrors<TFieldValues>
	placeholder?: string
}

export function InputOrSelect<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ control, label, name, groups, errors, placeholder }: InputOrSelectProps<TFieldValues, TName>) {
	return (
		<div className="w-full">
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, value } }) => (
					<InputOrSelectRaw
						onChange={onChange}
						value={value ?? { type: InputOrSelectKind.Text, data: '' }}
						label={label}
						name={name}
						groups={groups}
						placeholder={placeholder}
					/>
				)}
			/>
			{errors && <FieldError errors={errors} name={name} />}
		</div>
	)
}

export enum InputOrSelectKind {
	Text = 'text',
	Option = 'option',
}

export interface GroupData {
	name: string
	options: string[] | { name: string; value: string }[]
	iconUrl?: string
}

export interface InputValue {
	type: InputOrSelectKind.Text
	data: string
}

export interface SelectValue {
	type: InputOrSelectKind.Option
	data: string
	groupName: string
	iconUrl?: string
}

export type InputOrSelectValue = InputValue | SelectValue

export interface InputOrSelectRawProps {
	name: string
	label?: string
	groups: GroupData[]
	value: InputOrSelectValue
	onChange: (value: InputOrSelectValue) => void
	placeholder?: string
	compact?: boolean
}

export function InputOrSelectRaw({
	name,
	groups,
	value,
	onChange,
	label,
	placeholder,
	compact,
}: InputOrSelectRawProps) {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const close = useCallback(() => setIsOpen(false), [])
	useOutsideClick(wrapperRef, close)
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="relative grow" ref={wrapperRef}>
			<div className="flex flex-col gap-1">
				{label && (
					<label className="text-sm font-bold" htmlFor={name}>
						{label}
					</label>
				)}
				{value.type === InputOrSelectKind.Option && (
					<InputValueBox
						compact={compact}
						value={value}
						onClose={() =>
							onChange({
								type: InputOrSelectKind.Text,
								data: '',
							})
						}
					/>
				)}
				{value.type === InputOrSelectKind.Text && (
					<input
						className={clsx(
							'px-2 py-1 border rounded border-slate-400 outline-rose-500',
							isOpen && 'outline-2 outline-offset-[-0.5px]'
						)}
						placeholder={placeholder}
						onFocus={() => setIsOpen(true)}
						id={name}
						autoComplete="off"
						name="name"
						value={value.data}
						onChange={(e) =>
							onChange({ type: InputOrSelectKind.Text, data: e.target.value })
						}
					/>
				)}
			</div>
			{groups.length !== 0 && (
				<div className="absolute left-0 right-0 z-10">
					<Fade isOpen={isOpen}>
						<div className="border border-slate-300 rounded mt-1 p-2 flex flex-col gap-1.5 bg-white shadow-md select-none overflow-x-auto">
							{groups.map((group, index) => (
								<Group
									key={index}
									name={group.name}
									options={group.options}
									iconUrl={group.iconUrl}
									onSelect={(value) => {
										onChange({
											type: InputOrSelectKind.Option,
											data: value,
											groupName: group.name,
											iconUrl: group.iconUrl,
										})
										setIsOpen(false)
									}}
								/>
							))}
						</div>
					</Fade>
				</div>
			)}
		</div>
	)
}

interface GroupProps {
	name: string
	options: string[] | { name: string; value: string }[]
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
							className="text-sm rounded py-0.5 px-1.5 cursor-pointer transition hover:bg-rose-50"
							onClick={() => onSelect(_.isString(option) ? option : option.name)}
						>
							{_.isString(option) ? (
								option
							) : (
								<div className="flex gap-2">
									<span>{option.name}</span>
									<span className="text-slate-400">{option.value}</span>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

interface InputValueBoxProps {
	value: SelectValue
	onClose: () => void
	compact?: boolean
}
function InputValueBox({ value, onClose, compact }: InputValueBoxProps) {
	return (
		<div
			className={clsx(
				'flex items-center justify-between border rounded border-slate-400',
				compact ? 'p-px' : 'p-1'
			)}
		>
			<div className="bg-gray-50 px-1.5 flex items-center gap-2 rounded">
				{value.iconUrl && <img className="w-4 h-4" src={value.iconUrl} alt="" />}
				<span className="font-medium">{value.groupName}</span>
				<span>{value.data}</span>
			</div>
			<button
				className="p-0.5 text-lg transition rounded text-rose-500 hover:bg-rose-50"
				onClick={onClose}
			>
				<IoClose />
			</button>
		</div>
	)
}
