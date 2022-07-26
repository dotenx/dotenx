import {
	Controller,
	FieldErrors,
	FieldPath,
	FieldValues,
	UseControllerProps,
} from 'react-hook-form'
import { FieldError } from './field'
import { InputOrSelectKind, InputValue } from './input-or-select'

interface TextareaProps<TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>
	extends UseControllerProps<TFieldValues, TName> {
	errors?: FieldErrors<TFieldValues>
	label?: string
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
				render={({ field: { onChange, value, name } }) => (
					<RawTextarea name={name} onChange={onChange} value={value} />
				)}
			/>

			{rest.name && errors && <FieldError errors={errors} name={rest.name} />}
		</div>
	)
}

Textarea.displayName = 'Textarea'

function RawTextarea({
	name,
	value,
	onChange,
}: {
	name: string
	value: InputValue
	onChange: (value: InputValue) => void
}) {
	return (
		<textarea
			className="px-2 py-1 border rounded-lg border-slate-400 placeholder:text-slate-500 outline-rose-500 focus:ring-0 focus:border-slate-400 form-input focus:outline outline-2 outline-offset-[-1px]"
			id={name}
			onChange={(e) => onChange({ type: InputOrSelectKind.Text, data: e.target.value })}
			value={value?.data ?? ''}
			autoComplete="off"
			name={name}
		/>
	)
}
