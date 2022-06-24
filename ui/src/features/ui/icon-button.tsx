import { ButtonHTMLAttributes, useState } from 'react'
import { Fade } from './animation/fade'
import { Loader } from './loader'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	tooltip?: string
	loading?: boolean
}

export function IconButton(props: IconButtonProps) {
	const [isOpen, setIsOpen] = useState(false)
	const disabled = props.disabled || props.loading

	return (
		<div
			className="relative"
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
		>
			<button
				className="flex items-center justify-center w-8 h-8 text-2xl transition rounded focus:bg-gray-100 outline-rose-500 hover:bg-gray-100 disabled:hover:bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed"
				{...props}
				disabled={disabled}
			>
				{props.loading ? <Loader size={20} /> : props.children}
			</button>
			{props.tooltip && (
				<Fade isOpen={isOpen && !disabled}>
					<div className="absolute right-12 z-10 flex px-2 py-1 font-semibold text-xs text-white bg-rose-600 rounded items-center top-[50%] -translate-y-[50%]">
						{props.tooltip}
						<div className="absolute w-2 h-2 rotate-45 bg-rose-600 rounded-sm -right-0.5 -z-10" />
					</div>
				</Fade>
			)}
		</div>
	)
}
