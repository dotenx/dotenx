import { IoTrash } from 'react-icons/io5'

interface DeleteButtonProps {
	onClick: () => void
}

export function DeleteButton({ onClick }: DeleteButtonProps) {
	return (
		<button
			className="p-1 text-2xl transition rounded-md hover:text-rose-600 hover:bg-rose-50"
			type="button"
			onClick={onClick}
		>
			<IoTrash />
		</button>
	)
}
