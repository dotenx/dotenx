import clsx from 'clsx'
import { ReactNode, useState } from 'react'
import { IoTrash } from 'react-icons/io5'
import { ReactComponent as EmptySvg } from '../../assets/images/empty.svg'

interface TableProps {
	title: string
	headers: string[]
	items: ReactNode[] | undefined
	actionBar?: ReactNode
	emptyText: string
}

export function Table({ title, headers, items = [], actionBar, emptyText }: TableProps) {
	return (
		<div className="flex flex-col gap-8">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold leading-loose">{title}</h2>
				{items?.length !== 0 && actionBar}
			</div>
			{items?.length === 0 ? (
				<div className="flex flex-col items-center gap-12 mt-16 font-medium text-slate-500">
					<span className="text-lg">{emptyText}</span>
					{actionBar}
					<EmptySvg className="fixed -right-20 -bottom-80" />
				</div>
			) : (
				<div className="border rounded">
					<div
						className="grid px-6 py-2 font-semibold bg-gray-200"
						style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}
					>
						{headers.map((header) => (
							<div key={header} className="last:text-right">
								{header}
							</div>
						))}
					</div>
					<div>{items}</div>
				</div>
			)}
		</div>
	)
}

interface ItemProps {
	children?: ReactNode
	values: string[]
	onDelete: () => void
}

export function Item({ children, values, onDelete }: ItemProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="p-5 overflow-hidden text-slate-500 even:bg-gray-50">
			<div
				className={clsx(
					'grid items-center p-1 transition',
					children && 'hover:bg-gray-100 rounded cursor-pointer'
				)}
				style={{ gridTemplateColumns: `repeat(${values.length + 1}, 1fr)` }}
				onClick={() => setIsOpen((isOpen) => !isOpen)}
			>
				{values.map((value, index) => (
					<div key={index}>{value || '-'}</div>
				))}
				<button
					className="p-1 text-2xl transition rounded place-self-end hover:text-rose-600 hover:bg-rose-50"
					type="button"
					onClick={onDelete}
				>
					<IoTrash />
				</button>
			</div>
			{isOpen && children && <div className="p-1 text-xs">{children}</div>}
		</div>
	)
}

interface DetailProps {
	label: string
	value: string
}

export function Detail({ label, value }: DetailProps) {
	if (!value) return null

	return (
		<div className="p-1">
			<div>
				<span className="font-medium">{label}:</span> {value}
			</div>
		</div>
	)
}
