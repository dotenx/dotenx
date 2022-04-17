import clsx from 'clsx'

interface ToggleProps {
	label: string
	checked: boolean
	onClick: () => void
}

export function Toggle({ label, checked, onClick }: ToggleProps) {
	return (
		<div className="flex items-center gap-3" onClick={onClick}>
			<span className="text-xs sr">{label}</span>
			<div
				className={clsx(
					'flex items-center w-10 h-5 rounded-full relative transition',
					checked ? 'bg-black' : 'bg-gray-400'
				)}
			>
				<div
					className={clsx(
						'absolute w-5 h-5 bg-white rounded-full transition border-2',
						checked ? 'translate-x-full border-black' : 'translate-x-0 border-gray-400'
					)}
				></div>
			</div>
		</div>
	)
}
