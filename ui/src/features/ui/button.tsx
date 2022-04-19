import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ className, ...rest }: ButtonProps) {
	return (
		<button
			className={clsx(
				'flex items-center justify-center w-full py-2 font-medium text-white bg-rose-600 transition  rounded-lg cursor-pointer disabled:cursor-not-allowed hover:bg-rose-700 focus:bg-rose-700 outline-rose-500 outline-offset-2',
				className
			)}
			{...rest}
		/>
	)
}
