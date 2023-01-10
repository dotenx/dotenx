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

export default function CustomQuery() {
	const [openModal, setOpenModal] = useState(false)
	const [showResault, setShowResault] = useState(false)
	const [query, setQuery] = useState('')
	const [error, setError] = useState('')
	const [rowsffected, setRowsffected] = useState<number>()
	const [responseRows, setResponseRows] = useState<any>()
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
				setResponseRows(res.rows), setShowResault(true)
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
			<Button
				onClick={() => setOpenModal(true)}
				rightIcon={<TbCodeMinus className="w-5 h-5" />}
			>
				Run Custom Query
			</Button>
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
							<div className="font-normal">Total rows: {responseRows.length}</div>
							{responseRows.map((r: any, index: number) => {
								const formatJSON = (val: string) => {
									try {
										const res = JSON.parse(val)
										return JSON.stringify(res, null, 2)
									} catch {
										const errorJson = {
											error: `${val}`,
										}
										return JSON.stringify(errorJson, null, 2)
									}
								}
								return (
									<>
										<span className="text-sm text-gray-600">
											row: {index + 1}
										</span>
										<Editor
											theme="vs-dark"
											className="my-2"
											key={index}
											defaultValue={formatJSON(JSON.stringify(r))}
											defaultLanguage={'json'}
											height="300px"
											options={{
												readOnly: true,
											}}
										/>
									</>
								)
							})}
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
						{rowsffected && (
							<div className="text-green-800 mt-2 text-sm">
								Number of affected rows: {rowsffected}
							</div>
						)}
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
