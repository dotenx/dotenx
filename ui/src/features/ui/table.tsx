/* eslint-disable react/jsx-key */
import { Loader, Table as MantineTable, TextInput, Title } from '@mantine/core'
import Fuse from 'fuse.js'
import _ from 'lodash'
import { ReactNode, useMemo, useState } from 'react'
import { IoSearch } from 'react-icons/io5'
import { Column, useTable } from 'react-table'
import { ReactComponent as EmptySvg } from '../../assets/images/empty.svg'
import { HelpDetails, HelpPopover } from './help-popover'

interface TableProps<D extends object = Record<string, string>> {
	title: string
	subtitle?: string
	actionBar?: ReactNode
	emptyText?: string
	columns: Column<D>[]
	data: D[] | undefined
	loading?: boolean
	helpDetails?: HelpDetails
}

export function Table<D extends object = Record<string, string>>({
	title,
	subtitle,
	actionBar,
	emptyText,
	columns,
	data = [],
	loading,
	helpDetails,
}: TableProps<D>) {
	const [search, setSearch] = useState('')
	const fuzzySearch = useMemo(
		() =>
			new Fuse(data, {
				keys: _.uniq(
					columns.filter((col) => col.accessor).map((col) => col.accessor as string)
				),
			}),
		[columns, data]
	)
	const searched = useMemo(() => {
		if (search) return fuzzySearch.search(search).map((item) => item.item)
		return data
	}, [data, fuzzySearch, search])
	const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
		columns,
		data: searched,
	})

	return (
		<div className="flex flex-col gap-10">
			<div className="flex justify-between ">
				<div className="flex justify-start">
					<Title order={2} sx={{ display: 'inline-flex' }}>
						{title}
					</Title>

					{helpDetails && <HelpPopover helpDetails={helpDetails} />}
				</div>

				{data.length !== 0 && <span>{actionBar}</span>}
			</div>
			<div className="flex justify-start bg-red-200">
				<div className="text-sm -mt-8 font-medium">{subtitle}</div>
			</div>
			{loading && (
				<div className="left-1/2 top-1/3 absolute">
					<Loader color="red" />
				</div>
			)}
			{!loading && data.length === 0 && (
				<div className="flex flex-col items-center gap-12 mt-16 font-medium text-slate-500">
					{actionBar}
					<span className="text-lg">{emptyText}</span>
					{/* <EmptySvg className="fixed hidden -right-20 -bottom-80 -z-10 md:block" /> */}
				</div>
			)}
			{(data.length !== 0 || !emptyText) && (
				<div className="flex flex-col gap-6">
					<TextInput
						icon={<IoSearch className="text-xl" />}
						value={search}
						placeholder="Search..."
						onChange={(e) => setSearch(e.target.value)}
						className="max-w-xs"
					/>
					<div className="overflow-hidden border rounded-md">
						<MantineTable
							striped
							verticalSpacing="xl"
							horizontalSpacing="xl"
							{...getTableProps()}
						>
							<thead className="bg-gray-200">
								{headerGroups.map((headerGroup) => (
									<tr {...headerGroup.getHeaderGroupProps()}>
										{headerGroup.headers.map((column) => (
											<th
												className="text-left last:text-right last:flex last:justify-end first:!justify-start !py-2"
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
										<tr {...row.getRowProps()}>
											{row.cells.map((cell) => {
												return (
													<td
														className="last:text-right first:!text-left"
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
						</MantineTable>
						{searched.length === 0 && (
							<div className="p-10 text-xs font-black text-center text-slate-600">
								No items found
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
