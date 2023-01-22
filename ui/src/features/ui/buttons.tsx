import { ReactNode } from 'react'
import { BsPlusLg } from 'react-icons/bs'

export const AddButton = ({
	handleClick,
	text,
	icon,
}: {
	handleClick: () => void
	text: string
	icon?: ReactNode | JSX.Element
}) => {
	return (
		<button
			className="active:translate-y-[2px] flex transition-all px-4 gap-x-2 hover:text-slate-700  hover:bg-slate-50 items-center p-2 rounded-[10px] bg-white  text-slate-900   font-medium"
			onClick={handleClick}
		>
			{icon ? icon : <BsPlusLg />}
			{text}
		</button>
	)
}
export const PrimaryButton = ({
	handleClick,
	icon,
	text,
	white,
}: {
	handleClick: () => void
	icon: JSX.Element | ReactNode
	text: string
	white?: boolean
}) => {
	return (
		<button
			className={`active:translate-y-[2px] gap-x-2 flex transition-all  items-center p-2 px-4  rounded-[10px]    font-medium ${
				white
					? 'bg-white  hover:bg-slate-50 text-slate-900 hover:text-slate-700  '
					: 'bg-rose-600  hover:bg-rose-700 text-white '
			}`}
			onClick={handleClick}
		>
			{icon}
			{text}
		</button>
	)
}
