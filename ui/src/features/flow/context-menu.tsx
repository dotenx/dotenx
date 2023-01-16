import { useRef } from "react"
import { useOutsideClick } from "../hooks"
import { Fade } from "../ui"

interface ContextMenuProps {
	onClose: () => void
	onDelete: () => void
	isOpen: boolean
}

export function ContextMenu({ onClose, onDelete, isOpen }: ContextMenuProps) {
	const ref = useRef(null)
	useOutsideClick(ref, onClose)

	return (
		<Fade isOpen={isOpen}>
			<div
				ref={ref}
				className="absolute text-slate-600 right-full transform -translate-y-1/2 bg-white top-1/2 text-[7px] rounded-sm drop-shadow mr-1.5 px-0.5 py-0.5"
			>
				<button
					className="px-1 font-medium transition py-0.5 rounded-sm hover:bg-rose-100"
					type="button"
					onClick={onDelete}
				>
					Delete
				</button>
			</div>
		</Fade>
	)
}
