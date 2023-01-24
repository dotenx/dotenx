import { Button, Tooltip } from "@mantine/core"
import { useRef, useState } from "react"
import { useMutation, useQuery } from "react-query"
import { exportDatabase, runExportDatabase } from "../../api"
import { MdOutlineMoreVert } from "react-icons/md"
import { useOutsideClick } from "../hooks"
import { TbFileDownload, TbFileExport } from "react-icons/tb"
type Format = "dump" | "csv"
export default function ExportDatabase({ projectName }: { projectName: string }) {
	const [url, setUrl] = useState("")
	const [format, setFormat] = useState<Format>("dump")
	const [showDownload, setShowDownload] = useState(false)
	const [openOptions, setOpenOptions] = useState(false)
	const ref = useRef(null)
	useOutsideClick(ref, () => setOpenOptions(false))

	const { isLoading, refetch: refetchRes } = useQuery(
		["res-export-database", format],
		() => exportDatabase(projectName, format),
		{
			onSuccess: (d) => {
				setShowDownload(true)
				setUrl("")
				if (format === "dump") {
					if (d.data.db_job.pg_dump_status === "pending") {
						setTimeout(() => {
							refetchRes()
						}, 500)
					} else if (d.data.db_job.pg_dump_status === "completed") {
						setUrl(d.data.db_job.pg_dump_url)
					}
				} else if (format === "csv") {
					if (d.data.db_job.csv_status === "pending") {
						setTimeout(() => {
							refetchRes()
						}, 500)
					} else if (d.data.db_job.csv_status === "completed") {
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
	const smallScreen = window.innerHeight < 750

	return (
		<div ref={ref} className="flex  items-center">
			<Button.Group>
				{showDownload ? (
					<Button
						variant="default"
						className={`!rounded-l-[10px] !h-10 ${
							smallScreen ? "!text-xs" : "!text-base"
						} `}
						leftIcon={<TbFileDownload className="w-6 h-6" />}
						loading={isLoading || mutationRun.isLoading || url === ""}
					>
						<a href={url} download>
							Download {format} file
						</a>
					</Button>
				) : (
					<Button
						className={`!rounded-l-[10px] !h-10 ${
							smallScreen ? "!text-xs" : "!text-base"
						}  `}
						variant="default"
						leftIcon={<TbFileExport className="w-6 h-6" />}
						loading={isLoading || mutationRun.isLoading}
						onClick={() => {
							mutationRun.mutate()
						}}
					>
						Export as {format} file
					</Button>
				)}
				<Tooltip openDelay={500} withinPortal withArrow label="Change export format">
					<Button
						variant="default"
						className={` !rounded-r-[10px] !h-10 ${openOptions && "!bg-gray-100"}`}
						onClick={() => setOpenOptions(!openOptions)}
					>
						<MdOutlineMoreVert className={`${smallScreen ? "w-5 h-5" : "w-6 h-6"}  `} />
					</Button>
				</Tooltip>
			</Button.Group>
			{openOptions && (
				<div className="cursor-pointer p-1 absolute z-10 bg-white right-[275px] top-[214px] py-3  rounded-sm  shadow-md">
					<div className="mb-2 text-sm px-1">Select file format</div>
					{["dump", "csv"].map((o, index) => (
						<div
							key={index}
							onClick={() => {
								setFormat(o as Format)
								setOpenOptions(false)
							}}
							className="transition-all hover:text-white rounded-md px-2 py-1 hover:bg-rose-500 font-medium"
						>
							{o}
						</div>
					))}
				</div>
			)}
		</div>
	)
}
