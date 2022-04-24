/* eslint-disable react/jsx-key */
import { ReactNode } from 'react'
import { Column, useTable } from 'react-table'
import { ReactComponent as EmptySvg } from '../../assets/images/empty.svg'

interface TableProps<D extends object = Record<string, string>> {
	title: string
	actionBar?: ReactNode
	emptyText?: string
	columns: Column<D>[]
	data: D[] | undefined
}

export function Table<D extends object = Record<string, string>>({
	title,
	actionBar,
	emptyText,
	columns,
	data = [],
}: TableProps<D>) {
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
		columns,
		data,
	})

	return (
		<div className="flex flex-col gap-10">
			<div className="flex items-center justify-between">
				<h3 className="text-2xl font-bold">{title}</h3>
				{data.length !== 0 && <span>{actionBar}</span>}
			</div>
			{data.length === 0 && (
				<div className="flex flex-col items-center gap-12 mt-16 font-medium text-slate-500">
					<span className="text-lg">{emptyText}</span>
					{actionBar}
					<EmptySvg className="fixed -right-20 -bottom-80" />
				</div>
			)}
			{data.length !== 0 && (
				<div className="overflow-hidden border rounded-md">
					<table className="w-full" {...getTableProps()}>
						<thead className="bg-gray-300">
							{headerGroups.map((headerGroup) => (
								<tr className="" {...headerGroup.getHeaderGroupProps()}>
									{headerGroup.headers.map((column) => (
										<th
											className="px-6 py-2 text-left last:text-right"
											{...column.getHeaderProps()}
										>
											{column.render('Header')}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody {...getTableBodyProps()}>
							{rows.map((row) => {
								prepareRow(row)
								return (
									<tr className="even:bg-gray-50" {...row.getRowProps()}>
										{row.cells.map((cell) => {
											return (
												<td
													className="px-6 py-6 text-slate-500 last:text-right"
													{...cell.getCellProps()}
												>
													{cell.render('Cell')}
												</td>
											)
										})}
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}
