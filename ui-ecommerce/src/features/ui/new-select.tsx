import clsx from "clsx"
import { useRef, useState } from "react"
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from "react-hook-form"
import { IoChevronDown } from "react-icons/io5"
import { useOutsideClick } from "../hooks"
import { Fade } from "./animation/fade"
import { FieldError } from "./field"
import { Loader } from "./loader"

interface Option {
	label: string
	value: unknown
}

export interface NewSelectProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> extends UseControllerProps<TFieldValues, TName> {
	label?: string
	errors?: FieldErrors<TFieldValues>
	options?: Option[]
	placeholder?: string
	loading?: boolean
}

export function NewSelect<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	label,
	errors,
	name,
	control,
	options = [],
	placeholder,
	loading,
	...rest
}: NewSelectProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1" {...rest}>
			{label && (
				<label htmlFor={name} className="text-sm font-bold">
					{label}
				</label>
			)}
			<SelectController
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

function SelectController<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	control,
	name,
	options,
	placeholder,
	loading,
}: NewSelectProps<TFieldValues, TName>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field: { onChange, value } }) => {
				return (
					<RawSelect
						onChange={(newValue) => onChange((newValue as Option)?.value)}
						value={
							options?.find((option) => option.value === value) ?? {
								label: "",
								value: "",
							}
						}
						options={options ?? []}
						placeholder={placeholder}
						loading={loading}
					/>
				)
			}}
		/>
	)
}

function RawSelect({
	onChange,
	options,
	value,
	placeholder,
	loading,
}: {
	value?: Option
	onChange: (value: Option) => void
	options: Option[]
	placeholder?: string
	loading?: boolean
}) {
	const [isOpen, setIsOpen] = useState(false)
	const wrapperRef = useRef<HTMLDivElement>(null)
	useOutsideClick(wrapperRef, () => setIsOpen(false))

	return (
		<div className="relative space-y-1" ref={wrapperRef}>
			<button
				type="button"
				className={clsx(
					"flex items-center justify-between w-full px-2 py-1 border rounded cursor-pointer border-slate-400 outline-rose-500",
					isOpen && "outline outline-2 outline-offset-[-1px]"
				)}
				onClick={() => setIsOpen((isOpen) => !isOpen)}
			>
				{(!value || !value.value) && <span className="text-slate-500">{placeholder}s</span>}
				{value && <span>{value.label}</span>}
				<IoChevronDown className="ml-2 text-slate-400" />
			</button>
			<div className="absolute inset-x-0 z-10">
				<Fade isOpen={isOpen}>
					<div className="p-1 overflow-auto bg-white border rounded shadow-md border-slate-300 max-h-96 scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300">
						{loading && <Loader className="py-4" />}
						{!loading && options.length === 0 && (
							<div className="p-1.5 text-xs font-thin text-center">No options</div>
						)}
						{options.map((option) => (
							<button
								type="button"
								className="w-full px-2 py-1 text-left transition rounded hover:bg-rose-50 focus:bg-rose-50 outline-rose-500"
								key={option.label}
								onClick={() => {
									onChange(option)
									setIsOpen(false)
								}}
							>
								{option.label}
							</button>
						))}
					</div>
				</Fade>
			</div>
		</div>
	)
}
