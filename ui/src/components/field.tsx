import { Interpolation, Theme } from '@emotion/react'
import { ErrorMessage } from '@hookform/error-message'
import { InputHTMLAttributes } from 'react'
import { Control, Controller, FieldErrors, useController } from 'react-hook-form'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string
	errors: FieldErrors
	name: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	control: Control<any>
}

export const fieldCss = (theme: Theme): Interpolation<Theme> => ({
	border: '1px solid',
	borderColor: theme.color.text,
	borderRadius: 4,
	padding: 4,
	height: 36,
})

const errorCss = (theme: Theme): Interpolation<Theme> => ({
	borderColor: theme.color.negative,
	':focus': {
		outlineStyle: 'solid',
		outlineWidth: '0.5px',
		outlineColor: theme.color.negative,
	},
})

export function Field({ label, errors, control, ...rest }: FieldProps) {
	const {
		fieldState: { error },
	} = useController({ name: rest.name, control })

	return (
		<div css={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
			<label
				htmlFor={rest.name}
				css={[{ fontSize: 14 }, (theme) => error && { color: theme.color.negative }]}
			>
				{label}
			</label>
			<Controller
				control={control}
				name={rest.name}
				defaultValue="" // This is a bit tricky, maybe needs to change for different value types in future
				render={({ field: { onChange, value, name, ref } }) => (
					<input
						css={[fieldCss, error && errorCss]}
						id={rest.name}
						onChange={onChange}
						value={value}
						ref={ref}
						{...rest}
						name={name}
					/>
				)}
			/>

			{rest.name && <FieldError errors={errors} name={rest.name} />}
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
			render={({ message }) => (
				<p css={(theme) => ({ fontSize: 12, color: theme.color.negative })}>{message}</p>
			)}
		/>
	)
}
