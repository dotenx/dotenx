import clsx from "clsx"
import { FormHTMLAttributes } from "react"

type FormProps = FormHTMLAttributes<HTMLFormElement>

export function Form({ children, className, ...rest }: FormProps) {
	return (
		<form className={clsx("flex flex-col gap-10", className)} {...rest}>
			{children}
		</form>
	)
}
