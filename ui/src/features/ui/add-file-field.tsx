import { ErrorMessage } from '@hookform/error-message'
import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'

import { BsFillFolderSymlinkFill } from 'react-icons/bs'
interface FieldProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	label: string
	errors?: FieldErrors<TFieldValues>
	placeholder?: string
}

export function AddFileField<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({ label, errors, control, ...rest }: FieldProps<TFieldValues, TName>) {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm font-medium">{label}</span>
			<label
				htmlFor={rest.name}
				className="flex items-center text-white w-1/4 justify-center  font-bold px-2 bg-rose-500 transition-colors hover:bg-rose-600 cursor-pointer py-1  rounded-lg   form-input "
			>
				<span className="mr-2">browse</span>
				<BsFillFolderSymlinkFill />
			</label>
			<Controller
				control={control}
				name={rest.name}
				render={({ field: { onChange, value, name, ref } }) => (
					<input
						type="file"
						className="hidden"
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
			{rest.name && errors && <AddFieldError errors={errors} name={rest.name} />}
		</div>
	)
}

AddFileField.displayName = 'AddFileField'

interface FieldErrorProps {
	errors?: FieldErrors
	name: string
}

export function AddFieldError({ name, errors }: FieldErrorProps) {
	return (
		<ErrorMessage
			name={name}
			errors={errors}
			render={({ message }) => <p className="text-xs text-red-600">{message}</p>}
		/>
	)
}
