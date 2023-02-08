import clsx from "clsx"

interface ToggleProps {
	label: string
	checked: boolean
	onClick: () => void
	className?: string
}

export function Toggle({ label, checked, onClick, className }: ToggleProps) {
	return (
		<div className={className}>
			<button
				type="button"
				className="flex items-center gap-3 rounded-full outline-rose-500 outline-offset-4 group"
				onClick={onClick}
			>
				<span className="text-xs sr">{label}</span>
				<div
					className={clsx(
						"flex items-center w-10 h-5 rounded-full relative transition",
						checked
							? "bg-rose-500 group-hover:bg-rose-600 group-focus:bg-rose-600"
							: "bg-slate-400 group-hover:bg-slate-500 group-focus:bg-slate-500"
					)}
				>
					<div
						className={clsx(
							"absolute w-5 h-5 bg-white rounded-full transition border-2",
							checked
								? "translate-x-full border-rose-500 group-hover:border-rose-600 group-focus:border-rose-600"
								: "translate-x-0 border-slate-400 group-hover:border-slate-500 group-focus:border-slate-500"
						)}
					></div>
				</div>
			</button>
		</div>
	)
}
