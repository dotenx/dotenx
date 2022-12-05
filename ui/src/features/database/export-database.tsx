import { Button } from '@mantine/core'
import { useRef, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { exportDatabase, runExportDatabase } from '../../api'
import { MdOutlineMoreVert } from 'react-icons/md'
import { useOutsideClick } from '../hooks'
type Format = 'dump' | 'csv'
export default function ExportDatabase({ projectName }: { projectName: string }) {
	const [url, setUrl] = useState('')
	const [format, setFormat] = useState<Format>('dump')
	const [showDownload, setShowDownload] = useState(false)
	const [openOptions, setOpenOptions] = useState(false)
	const ref = useRef(null)
	useOutsideClick(ref, () => setOpenOptions(false))

	const { isLoading, refetch: refetchRes } = useQuery(
		['res-export-database', format],
		() => exportDatabase(projectName, format),
		{
			onSuccess: (d) => {
				setShowDownload(true)
				setUrl('')
				if (format === 'dump') {
					if (d.data.db_job.pg_dump_status === 'pending') {
						setTimeout(() => {
							refetchRes()
						}, 500)
					} else if (d.data.db_job.pg_dump_status === 'completed') {
						setUrl(d.data.db_job.pg_dump_url)
					}
				} else if (format === 'csv') {
					if (d.data.db_job.csv_status === 'pending') {
						setTimeout(() => {
							refetchRes()
						}, 500)
					} else if (d.data.db_job.csv_status === 'completed') {
						setUrl(d.data.db_job.csv_url)
					}
				}
			},
			onError: (e: any) => {
				if (e.response.status === 400) {
					setShowDownload(false)
				}
			},
		}
	)
	const mutationRun = useMutation(() => runExportDatabase(projectName, format), {
		onSuccess: () => {
			setShowDownload(true)
			refetchRes()
		},
	})
	return (
		<div ref={ref} className="w-full flex justify-end items-center">
			{showDownload ? (
				<Button loading={isLoading || mutationRun.isLoading || url === ''} variant="subtle">
					<a href={url} download>
						Download {format} file
					</a>
				</Button>
			) : (
				<Button
					loading={isLoading || mutationRun.isLoading}
					variant="subtle"
					onClick={() => {
						mutationRun.mutate()
					}}
				>
					Export as {format} file
				</Button>
			)}
			<MdOutlineMoreVert
				className="w-10 h-10 cursor-pointer hover:bg-gray-50 p-2 transition-all rounded-md"
				onClick={() => setOpenOptions(!openOptions)}
			/>
			{openOptions && (
				<div className="cursor-pointer p-1 absolute z-10 bg-white top-[95px] py-3 rounded-md shadow-md">
					{['dump', 'csv'].map((o, index) => (
						<div
							key={index}
							onClick={() => {
								setFormat(o as Format)
								setOpenOptions(false)
							}}
							className="transition-all hover:text-white rounded-md px-2 py-1 hover:bg-red-500 font-medium"
						>
							{o}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
