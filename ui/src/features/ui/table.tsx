import clsx from 'clsx'
import { ReactNode, useState } from 'react'

interface TableProps {
	title: string
	headers: string[]
	items: ReactNode[] | undefined
}

export function Table({ title, headers, items = [] }: TableProps) {
	return (
		<div>
			<h2 className="text-2xl leading-loose">{title}</h2>
			{items?.length === 0 ? (
				<div className="mt-1.5">No items</div>
			) : (
				<div
					className="grid p-2 m-3 mb-4 border-b border-black"
					style={{ gridTemplateColumns: `repeat(${headers.length + 1}, 1fr)` }}
				>
					{headers.map((header) => (
						<div key={header}>{header}</div>
					))}
				</div>
			)}
			{items}
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
		<div className="m-4 overflow-hidden rounded bg-gray-50">
			<div
				className={clsx(
					'bg-gray-100 p-2 grid',
					children && 'hover:bg-gray-200 cursor-pointer'
				)}
				style={{ gridTemplateColumns: `repeat(${values.length + 1}, 1fr)` }}
				onClick={() => setIsOpen((isOpen) => !isOpen)}
			>
				{values.map((value, index) => (
					<div key={index}>{value || '-'}</div>
				))}
				<button
					className="px-2 ml-auto text-xs text-white bg-red-600 border border-red-600 rounded w-max hover:bg-white hover:text-red-600"
					type="button"
					onClick={onDelete}
				>
					Delete
				</button>
			</div>
			{isOpen && children && <div className="p-1">{children}</div>}
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
		<div className="p-2">
			<div>
				<span className="font-medium">{label}:</span> {value}
			</div>
		</div>
	)
}
