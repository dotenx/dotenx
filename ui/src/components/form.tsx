/** @jsxImportSource @emotion/react */
import { FormHTMLAttributes } from 'react'

type FormProps = FormHTMLAttributes<HTMLFormElement>

export function Form({ children, ...rest }: FormProps) {
	return (
		<form css={{ display: 'flex', flexDirection: 'column', gap: 40 }} {...rest}>
			{children}
		</form>
	)
}
