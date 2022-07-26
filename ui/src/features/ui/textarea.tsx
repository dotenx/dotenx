import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'
import { FieldError } from './field'

interface TextareaProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	errors?: FieldErrors<TFieldValues>
	label?: string
	placeholder?: string
}

export function Textarea<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	label,
	errors,
	control,
	...rest
}: TextareaProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label htmlFor={rest.name} className="text-sm font-bold">
					{label}
				</label>
			)}
			<Controller
				control={control}
				name={rest.name}
				render={({ field: { onChange, value, name, ref } }) => (
					<textarea
						className="px-2 py-1 border rounded-lg border-slate-400 placeholder:text-slate-500 outline-rose-500 focus:ring-0 focus:border-slate-400 form-input focus:outline outline-2 outline-offset-[-1px]"
						id={rest.name}
						onChange={onChange}
						value={value ?? ''}
						ref={ref}
						autoComplete="off"
						{...rest}
						name={name}
					/>
				)}
			/>

			{rest.name && errors && <FieldError errors={errors} name={rest.name} />}
		</div>
	)
}

Textarea.displayName = 'Textarea'
