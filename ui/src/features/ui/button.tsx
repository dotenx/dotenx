import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'filled' | 'outlined'
}

export function Button({ variant = 'filled', className, ...rest }: ButtonProps) {
	return (
		<button
			className={clsx(
				'flex items-center justify-center gap-1 w-full py-1.5 px-3 font-medium text-white transition rounded-lg cursor-pointer disabled:cursor-not-allowed outline-rose-500 outline-offset-4 whitespace-nowrap disabled:bg-gray-400 border border-rose-600 disabled:border-gray-400',
				variant === 'filled' && 'bg-rose-600 hover:bg-rose-700 focus:bg-rose-700',
				variant === 'outlined' &&
					'bg-white hover:bg-rose-50 focus:bg-rose-50 text-rose-600',
				className
			)}
			{...rest}
		/>
	)
}
