import { ErrorMessage } from '@hookform/error-message'
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'

export interface FieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	label?: string
	errors?: FieldErrors<TFieldValues>
	placeholder?: string
}

export function Field<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
	label,
	errors,
	control,
	...rest
}: FieldProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label htmlFor={rest.name} className="text-sm font-medium">
					{label}
				</label>
			)}
			<Controller
				control={control}
				name={rest.name}
				render={({ field: { onChange, value, name, ref } }) => (
					<input
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

Field.displayName = 'Field'

interface FieldErrorProps {
	errors?: FieldErrors
	name: string
}

export function FieldError({ name, errors }: FieldErrorProps) {
	return (
		<ErrorMessage
			name={name}
			errors={errors}
			render={({ message }) => <p className="text-xs text-red-600">{message}</p>}
		/>
	)
}
