import { Button, Modal } from '@mantine/core'
import { useState } from 'react'
import { TbCodeMinus } from 'react-icons/tb'
import Editor from '@monaco-editor/react'
import { FaPlay } from 'react-icons/fa'
import { useGetProjectTag } from '../../features/ui/hooks/use-get-project-tag'
import { runCustomQuery } from '../../api'
import { useMutation } from 'react-query'
import { toast } from 'react-toastify'
import { IoIosArrowBack } from 'react-icons/io'
import { PrimaryButton, Table } from '../ui'

export default function CustomQuery() {
	const [openModal, setOpenModal] = useState(false)
	const [showResault, setShowResault] = useState(false)
	const [query, setQuery] = useState('')
	const [error, setError] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [rowsffected, setRowsffected] = useState<number>()
	const [responseRows, setResponseRows] = useState<any>()
	const [columns, setColumns] = useState<any>([])
	const { projectTag, isLoading: projectTagisLoading } = useGetProjectTag()
	const mutationRun = useMutation(() => runCustomQuery(projectTag, query), {
		onSuccess: (d) => {
			const res = d.data
			if (res.total_rows === 0) {
				toast('Query ran successfully.', {
					type: 'success',
					autoClose: 2000,
				})
				setRowsffected(res.rows_affected)
			} else {
				const columns = Object.keys(res.rows[0]).map((k) => {
					return {
						Header: k,
						accessor: k,
						Cell: ({ value }: { value: any }) => (
							<div>
								<span>{value === null ? '-' : value.toString()}</span>
							</div>
						),
					}
				})
				columns.splice(
					0,
					0,
					columns.splice(
						columns.findIndex((x) => x.Header === 'id'),
						1
					)[0]
				)
				columns.splice(
					1,
					0,
					columns.splice(
						columns.findIndex((x) => x.Header === 'creator_id'),
						1
					)[0]
				)

				setResponseRows(res.rows)
				setColumns(columns), setShowResault(true)
			}
		},
		onError: (e: any) => {
			if (e.response.status === 400) {
				setError(e.response.data.message)
			} else
				toast('Something went wrong. Please try again later.', {
					type: 'error',
					autoClose: 2000,
				})
		},
	})

	return (
		<div className="flex items-center">
			<PrimaryButton
				icon={<TbCodeMinus className="w-5 h-5" />}
				text="Run Custom Query"
				handleClick={() => setOpenModal(true)}
			/>
			<Modal
				size="xl"
				title="Run custom query"
				onClose={() => setOpenModal(false)}
				opened={openModal}
			>
				{showResault ? (
					<div>
						<Button
							leftIcon={<IoIosArrowBack className="w-4  h-4 " />}
							onClick={() => setShowResault(false)}
							variant={'light'}
							className="mb-2"
						>
							New query
						</Button>
						<div className="max-h-[650px] overflow-y-auto p-2">
							<div className="font-normal -mb-5">
								Total rows: {responseRows.length}
							</div>
							<div className="overflow-x-auto w-full">
								<Table
									withoutSearch
									withPagination
									currentPage={currentPage}
									nPages={Math.ceil(responseRows.length / 10)}
									setCurrentPage={setCurrentPage}
									columns={columns}
									data={responseRows}
								/>
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="mb-1">Enter query:</div>
						<Editor
							defaultValue={query}
							defaultLanguage={'sql'}
							height="300px"
							theme="vs-dark"
							onChange={(value) => {
								setError(''), setQuery(value ?? '')
							}}
						/>
						{error && <div className="my-2 text-sm text-rose-500">{error}</div>}
						{rowsffected === 0 && (
							<div className="mt-2 text-sm">no rows in the result.</div>
						)}
						{rowsffected && rowsffected > 0 ? (
							<div className="text-green-800 mt-2 text-sm">
								Number of affected rows: {rowsffected}
							</div>
						) : null}
						<div className="flex w-full justify-end">
							<Button
								disabled={!query || projectTagisLoading}
								onClick={() => {
									setError('')
									mutationRun.mutate()
								}}
								loading={mutationRun.isLoading}
								rightIcon={<FaPlay className="w-3 h-3" />}
								className=" mt-2"
							>
								Run
							</Button>
						</div>
					</>
				)}
			</Modal>
		</div>
	)
}
