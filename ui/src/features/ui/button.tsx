import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className, ...rest }: ButtonProps) {
	return (
		<button
			className={clsx(
				'flex items-center justify-center w-full p-1 font-medium text-white bg-black border border-black rounded cursor-pointer disabled:cursor-not-allowed hover:bg-white hover:text-black',
				className
			)}
			{...rest}
		/>
	)
}
