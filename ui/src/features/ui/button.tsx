import clsx from 'clsx'
import { ButtonHTMLAttributes } from 'react'
import { Loader } from './loader'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'filled' | 'outlined' | 'icon'
	loading?: boolean
}

export function Button({
	children,
	disabled,
	variant = 'filled',
	loading,
	className,
	...rest
}: ButtonProps) {
	return (
		<button
			className={clsx(
				'flex items-center justify-center gap-1 font-medium text-white transition rounded-lg cursor-pointer disabled:cursor-not-allowed outline-rose-500 outline-offset-4 whitespace-nowrap disabled:bg-gray-400 border-rose-600 disabled:border-gray-400',
				variant === 'filled' &&
					'bg-rose-600 hover:bg-rose-700 focus:bg-rose-700 w-full border',
				variant === 'outlined' &&
					'bg-white hover:bg-rose-50 focus:bg-rose-50 text-rose-600 w-full border',
				variant !== 'icon' && 'py-[7px] px-3',
				variant === 'icon' && 'text-rose-600 hover:bg-rose-50 w-10 h-10',
				loading && variant !== 'icon' && 'disabled:bg-rose-600 disabled:border-rose-600',
				loading &&
					variant === 'icon' &&
					'disabled:bg-transparent disabled:border-transparent',
				className
			)}
			disabled={disabled || loading}
			{...rest}
		>
			{loading ? (
				<Loader size={variant === 'icon' ? 24 : 80} className="py-[9px]" />
			) : (
				children
			)}
		</button>
	)
}
