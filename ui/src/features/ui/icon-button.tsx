import { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	tooltip?: string
}

export function IconButton(props: IconButtonProps) {
	return (
		<div className="relative group">
			<button
				className="flex items-center justify-center p-1 text-xl rounded hover:bg-gray-100 disabled:hover:bg-white disabled:text-gray-400 disabled:cursor-not-allowed"
				{...props}
			>
				{props.children}
			</button>
			{props.tooltip && !props.disabled && (
				<div className="absolute hidden px-2 py-1 mt-2 text-xs text-white bg-gray-900 rounded group-hover:block left-[50%] -translate-x-[50%]">
					{props.tooltip}
				</div>
			)}
		</div>
	)
}
