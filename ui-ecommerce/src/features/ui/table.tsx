/* eslint-disable react/jsx-key */
import { Table as MantineTable, TextInput, Title } from "@mantine/core"
import Fuse from "fuse.js"
import _ from "lodash"
import { ReactNode, useMemo, useState } from "react"
import { IoSearch } from "react-icons/io5"
import { Column, useTable } from "react-table"
import { HelpDetails, HelpPopover } from "./help-popover"
import { Loader } from "./loader"

interface TableProps<D extends object = Record<string, string>> {
	title?: string
	subtitle?: string
	actionBar?: ReactNode
	emptyText?: string
	columns: Column<D>[]
	data: D[] | undefined
	loading?: boolean
	withoutSearch?: boolean
	helpDetails?: HelpDetails
	withPagination?: boolean
	currentPage?: number
	nPages?: number
	setCurrentPage?: (page: number) => void
}

export function Table<D extends object = Record<string, string>>({
	title,
	withoutSearch,
	subtitle,
	currentPage,
	setCurrentPage,
	nPages,
	actionBar,
	emptyText,
	columns,
	data = [],
	loading,
	helpDetails,
	withPagination,
}: TableProps<D>) {
	const [search, setSearch] = useState("")
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

	if (loading) return <Loader />

	return (
		<div className="flex flex-col gap-10">
			{title && (
				<div className="flex justify-between ">
					<div className="flex justify-start">
						<Title order={2} sx={{ display: "inline-flex" }}>
							{title}
						</Title>

						{helpDetails && <HelpPopover helpDetails={helpDetails} />}
					</div>
				</div>
			)}
			<div className="flex justify-start bg-red-200">
				<div className="-mt-8 text-sm font-medium">{subtitle}</div>
			</div>
			{data.length === 0 && (
				<div className="flex flex-col items-center gap-12 mt-16 font-medium text-slate-500">
					<span className="text-lg">{emptyText}</span>
				</div>
			)}
			{(data.length !== 0 || !emptyText) && (
				<div className="flex flex-col bg-white grow">
					<div className="p-4 bg-gray-300 flex justify-between">
						{!withoutSearch && (
							<TextInput
								icon={<IoSearch className="text-xl" />}
								value={search}
								placeholder="Search..."
								onChange={(e) => setSearch(e.target.value)}
								className="w-56"
								styles={{ input: { border: "none" } }}
								radius="md"
								size="xs"
							/>
						)}
						{actionBar}
					</div>
					<div className="max-w-full overflow-auto scrollbar-thin scrollbar-track-rounded-sm scrollbar-corner-rounded-sm scrollbar-thumb-rounded-sm scrollbar-thumb-gray-900 scrollbar-track-gray-100">
						<MantineTable
							verticalSpacing="lg"
							horizontalSpacing="lg"
							highlightOnHover
							fontSize={13}
							{...getTableProps()}
						>
							<thead className="bg-gray-300 uppercase">
								{headerGroups.map((headerGroup) => (
									<tr {...headerGroup.getHeaderGroupProps()}>
										{headerGroup.headers.map((column) => (
											<th
												className="!font-bold !text-slate-900 !whitespace-nowrap !py-2 !border-gray-500 border-b"
												{...column.getHeaderProps()}
											>
												{column.render("Header")}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody {...getTableBodyProps()}>
								{rows.map((row) => {
									prepareRow(row)
									return (
										<tr className="group/row" {...row.getRowProps()}>
											{row.cells.map((cell) => {
												return (
													<td
														className="text-slate-500 font-medium text-xs !overflow-hidden !whitespace-nowrap !text-ellipsis max-w-xs !border-gray-500 border-b"
														title={cell?.value?.toString()}
														{...cell.getCellProps()}
													>
														{cell.render("Cell")}
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
					{withPagination && (nPages || 1) !== 1 && (
						<div className="py-4 px-6">
							<Pagination
								currentPage={currentPage || 1}
								nPages={nPages || 1}
								setCurrentPage={setCurrentPage}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

const Pagination = ({
	currentPage,
	setCurrentPage,
	nPages,
}: {
	currentPage: number
	nPages: number
	setCurrentPage?: (page: number) => void
}) => {
	const pageNumbers = [...Array(nPages + 1).keys()].slice(1)

	const nextPage = () => {
		setCurrentPage?.(currentPage + 1)
	}
	const prevPage = () => {
		setCurrentPage?.(currentPage - 1)
	}
	if (nPages === 1) return null
	return (
		<div className="flex justify-end w-full select-none">
			<ul className="flex items-center space-x-2 font-medium">
				<li
					onClick={prevPage}
					className={`bg-slate-50 p-1 px-2 rounded cursor-pointer active:bg-slate-100 ${
						currentPage === 1 && "pointer-events-none opacity-70"
					}`}
				>
					Previous
				</li>
				{pageNumbers.map((pgNumber) => (
					<li
						onClick={() => setCurrentPage?.(pgNumber)}
						key={pgNumber}
						className={`bg-slate-50 p-1 px-2 rounded  cursor-pointer active:bg-slate-100 ${
							currentPage == pgNumber ? "bg-slate-200" : ""
						} `}
					>
						{pgNumber}
					</li>
				))}
				<li
					onClick={nextPage}
					className={`bg-slate-50 p-1 px-2 rounded cursor-pointer active:bg-slate-100 ${
						currentPage === nPages && "pointer-events-none opacity-70"
					}`}
				>
					Next
				</li>
			</ul>
		</div>
	)
}
