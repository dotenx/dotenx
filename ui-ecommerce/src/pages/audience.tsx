import { ActionIcon, Badge, Button, Modal, Switch, TextInput, Tooltip } from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import cronstrue from "cronstrue"
import { useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { IoClose, IoMail, IoReload } from "react-icons/io5"
import { IoMdSettings } from "react-icons/io"
import { MdOutlineTimer } from "react-icons/md"
import { RiDeleteBin2Line, RiFileList2Fill, RiMailSettingsFill } from "react-icons/ri"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
	activateEmailPipeline,
	deleteEmailPipeline,
	getEmailPipelineExecutions,
	getEmailPipelineList,
	getIntegrations,
	QueryKey,
	runPredefinedQuery,
} from "../api"
import { IntegrationForm } from "../features/app/addIntegrationForm"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { AudienceStats } from "./analytics"
import { UpdateIntegrationForm } from "../features/app/updateIntegrationForm"

export function AudiencePage() {
	const [activeTab, setActiveTab] = useState<"members" | "schedules">("members")

	return (
		<div>
			<Header
				tabs={["members", "schedules"]}
				title="Audience"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "members" && <MembersTab />}
				{activeTab === "schedules" && <SchedulesTab />}
			</ContentWrapper>
		</div>
	)
}

function ActionBar() {
	const { projectName } = useGetProjectTag()
	const [openModal, setOpenModal] = useState(false)
	const [openSettingsModal, setOpenSettingsModal] = useState(false)
	const query = useQuery([QueryKey.GetIntegrations], () =>
		getIntegrations({ type: "sendGrid", projectName })
	)
	const client = useQueryClient()
	const IntegrationName = query?.data?.data[0]?.name ?? ""
	return (
		<div className="flex gap-x-5 items-center">
			{!IntegrationName && query.isSuccess && (
				<div className="text-sm p-1 px-2 bg-blue-50 rounded text-gray-600 flex items-center gap-x-2">
					You must connect your poject to SendGrid to send emails{" "}
					<Button onClick={() => setOpenModal(true)} color="blue" size="xs">
						Connect
					</Button>
				</div>
			)}
			{IntegrationName && query.isSuccess && (
				<Button
					leftIcon={<IoMdSettings className="h-5 w-5" />}
					onClick={() => setOpenSettingsModal(true)}
					color="blue"
				>
					SendGrid
				</Button>
			)}

			<Button
				disabled={!IntegrationName}
				leftIcon={<IoMail className="h-5 w-5" />}
				component={Link}
				to="new"
			>
				New Schedule
			</Button>
			<Modal opened={openModal} onClose={() => setOpenModal(false)}>
				<IntegrationForm
					integrationKind={"sendGrid"}
					onSuccess={() => {
						toast("Send-Grid integration added successfully", {
							type: "success",
							autoClose: 2000,
						}),
							client.invalidateQueries([QueryKey.GetIntegrations]),
							setOpenModal(false)
					}}
				/>
			</Modal>
			<Modal opened={openSettingsModal} onClose={() => setOpenSettingsModal(false)}>
				<UpdateIntegrationForm
					name={IntegrationName}
					integrationKind={"sendGrid"}
					onSuccess={() => {
						toast("Send-Grid integration updated successfully", {
							type: "success",
							autoClose: 2000,
						}),
							client.invalidateQueries([QueryKey.GetIntegrations]),
							setOpenModal(false)
					}}
				/>
			</Modal>
		</div>
	)
}

function MembersTab() {
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const [currentPage, setCurrentPage] = useState(1)
	const membersQuery = useQuery(
		["get_all_audience", projectTag],
		() => runPredefinedQuery(projectTag, "get_all_audience"),
		{ enabled: !!projectTag }
	)

	const members = membersQuery.data?.data?.rows ?? []
	const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
	const newMembers = members.filter((m) => m.updated_at >= yesterday)
	const nPages = Math.ceil((membersQuery.data?.data?.total_rows as number) / 10)
	const queryClient = useQueryClient()
	const refetchMembers = () => queryClient.invalidateQueries([QueryKey.GetMembersSummary])
	const stats = [
		{
			title: "Total members",
			value: members.length,
			isLoading: membersQuery.isLoading || !projectTag,
		},
		{
			title: "New Members (24h)",
			value: newMembers.length,
			isLoading: membersQuery.isLoading || !projectTag,
		},
	]

	return (
		<div>
			<div>
				<AudienceStats stats={stats} />
			</div>
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectQuery.isLoading || membersQuery.isLoading}
				emptyText="No members yet"
				actionBar={
					<ActionIcon onClick={refetchMembers}>
						<IoReload />
					</ActionIcon>
				}
				columns={[
					{
						Header: "Email",
						accessor: "email",
						Cell: ({ value }: { value: string }) => (
							<span className="flex items-center gap-x-2">
								<FaUserCircle className="h-6 w-6" />
								{value}
							</span>
						),
					},
				]}
				data={members}
			/>
		</div>
	)
}

function SchedulesTab() {
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const client = useQueryClient()
	const [executionList, setExecutionList] = useState<any>()
	const [pipelineName, setPipelineName] = useState<string>()
	const [pipelineDetails, setPipelineDetails] = useState<any>()
	const { mutate, isLoading } = useMutation(
		(pipelineName: string) =>
			deleteEmailPipeline({ pipelineName, projectName: projectQuery.projectName }),
		{
			onSuccess: () => {
				client.invalidateQueries([QueryKey.GetEmailPipelineList])
				toast("Pipeline deleted successfully", { type: "success", autoClose: 2000 })
			},
		}
	)
	const {
		mutate: mutatePipelineExecutions,
		isLoading: loadingPipelineExecutions,
		isSuccess: mutatePipelineExecutionsIsSuccess,
	} = useMutation(
		(pipelineName: string) =>
			getEmailPipelineExecutions({ pipelineName, projectName: projectQuery.projectName }),
		{
			onSuccess: (d) => {
				setExecutionList(d.data)
			},
		}
	)
	const { mutate: activePipelineMutate, isLoading: activateLoading } = useMutation(
		({ pipelineName, action }: { pipelineName: string; action: string }) =>
			activateEmailPipeline({ pipelineName, projectName: projectQuery.projectName, action }),
		{
			onSuccess: () => {
				setPipelineDetails("")
				client.invalidateQueries([QueryKey.GetEmailPipelineList])
			},
		}
	)
	const query = useQuery(
		[QueryKey.GetEmailPipelineList],
		() => getEmailPipelineList({ tag: projectTag }),
		{ enabled: !!projectTag }
	)
	const scheduleTableData = query?.data?.data.pipelines
	return (
		<>
			<Table
				loading={query.isLoading}
				columns={[
					{
						Header: "Email pipeline name",
						accessor: "name",
						Cell: ({ row }: { row: any }) => {
							return (
								<span
									className="cursor-pointer text-rose-600 "
									onClick={() => {
										setPipelineName(""), setPipelineDetails(row.original)
									}}
								>
									{row.original.name}
								</span>
							)
						},
					},
					{
						Header: "Subject",
						accessor: "",
						Cell: ({ row }: { row: any }) => {
							return <span>{row.original.metadata.subject}</span>
						},
					},
					{
						Header: "Active",
						accessor: "is_active",
						Cell: ({ row }: { row: any }) => {
							return (
								<Tooltip
									withArrow
									openDelay={700}
									label={`${
										row.original.is_active ? "Deactivate" : "Activate"
									} email pipeline`}
								>
									<div className="w-fit">
										<Switch
											size="md"
											readOnly
											disabled={activateLoading}
											name="is_active"
											checked={row.original.is_active}
											onClick={() => {
												activePipelineMutate({
													pipelineName: row.original.name,
													action: row.original.is_active
														? "deactivate"
														: "activate",
												})
											}}
										/>
									</div>
								</Tooltip>
							)
						},
					},
					{
						Header: "History",
						accessor: "-",
						Cell: ({ row }: { row: any }) => {
							return (
								<Tooltip withArrow openDelay={500} label="Show details">
									<div className="w-fit ml-4">
										<RiFileList2Fill
											onClick={() => {
												setPipelineDetails("")
												setPipelineName(row.original.name),
													mutatePipelineExecutions(row.original.name)
											}}
											className={`cursor-pointer h-6 w-6 ${
												loadingPipelineExecutions && "animate-pulse"
											}`}
										/>
									</div>
								</Tooltip>
							)
						},
					},
					{
						Header: "",
						accessor: "_",
						Cell: ({ row }: { row: any }) => {
							return (
								<Tooltip withArrow openDelay={700} label="Delete email pipeline">
									<div className="w-fit">
										<RiDeleteBin2Line
											onClick={() => mutate(row.original.name)}
											className={`cursor-pointer h-6 w-6 opacity-25 hover:opacity-100 transition-all hover:text-red-500 ${
												isLoading && "animate-pulse"
											}`}
										/>
									</div>
								</Tooltip>
							)
						},
					},
				]}
				data={scheduleTableData}
			/>
			{mutatePipelineExecutionsIsSuccess && pipelineName && (
				<div className="bg-white p-5 mt-5">
					<div>
						<div className=" text-lg w-fit bg-gray-50 p-1  rounded-sm flex items-center gap-x-1">
							<RiFileList2Fill className="h-6 w-6" /> {pipelineName} executions
						</div>
					</div>
					<div className="space-y-3 mt-5 p-2 bg-gray-50  ">
						<div className="text-sm">Execution dates</div>
						{executionList.length === 0 ? (
							<div className="w-full text-center">No executions yet </div>
						) : (
							<div className="space-y-2">
								{executionList?.map((e: any) => (
									<div
										className={`w-fit bg-gray-300 font-medium  border p-2 flex items-center rounded-full px-4 gap-x-2 text-sm `}
									>
										<MdOutlineTimer className="h-5 w-5  " />
										{e.StartedAt.substring(0, 10)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
			{pipelineDetails && (
				<div>
					<PipelineDetails
						details={pipelineDetails}
						onClose={() => setPipelineDetails("")}
					/>
				</div>
			)}
		</>
	)
}
const PipelineDetails = ({ details, onClose }: { details: any; onClose: () => void }) => {
	const [activeTab, setActiveTab] = useState<"details" | "content">("details")
	const scheduleExpression = details?.metadata?.schedule_expression
	const navigate = useNavigate()

	return (
		<div className="mt-10 bg-white">
			<div className="w-full justify-end pr-3 flex pt-2 cursor-pointer">
				<IoClose onClick={() => onClose()} />
			</div>
			<Header
				children={<Button onClick={() => navigate(`${details.name}`)}>Edit</Button>}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				tabs={["details", "content"]}
				title={
					<div>
						<span className="text-lg bg-gray-50 p-1 px-2 rounded-sm flex items-center gap-x-1">
							<RiMailSettingsFill className="h-6 w-6" />
							{details.name}
						</span>
						<Badge
							size="lg"
							radius={"sm"}
							variant="dot"
							color={`${details.is_active ? "green" : "yellow"}`}
							leftSection={<MdOutlineTimer className="h-5 w-5  " />}
							className=" flex items-center "
						>
							{cronstrue
								.toString(scheduleExpression, {
									throwExceptionOnParseError: false,
								})
								.includes("error")
								? scheduleExpression
								: cronstrue.toString(
										scheduleExpression.substring(
											5,
											scheduleExpression.length - 1
										),
										{
											throwExceptionOnParseError: false,
										}
								  )}
						</Badge>
					</div>
				}
			></Header>
			<ContentWrapper>
				{activeTab === "details" && <DetailsTab details={details} />}
				{activeTab === "content" && (
					<div className="prose">
						<div
							dangerouslySetInnerHTML={{
								__html: details?.metadata?.html_content,
							}}
						/>
					</div>
				)}
			</ContentWrapper>
		</div>
	)
}
const DetailsTab = ({ details }: { details: any }) => {
	return (
		<div className="bg-gray-50 space-y-2 px-4 py-2">
			<TextInput
				readOnly
				label="From"
				value={details?.metadata?.from}
				className="w-full p-2"
			/>
			<TextInput
				readOnly
				label="Subject"
				value={details?.metadata?.subject}
				className="w-full p-2"
			/>
			<div className="w-full px-2">
				To{" "}
				{details?.metadata?.target?.product_ids?.length > 0 && (
					<div>
						<div className="flex text-sm items-center gap-x-1 bg-white border rounded-md border-gray-300 p-2 ">
							Product IDs:{" "}
							{details?.metadata?.target?.product_ids?.map((p: string) => {
								return (
									<div className="p-1 bg-gray-800 px-2 text-white rounded-md">
										{p}
									</div>
								)
							})}
						</div>
					</div>
				)}
				{details?.metadata?.target?.send_to_all && (
					<div>
						<div className="flex text-sm items-center gap-x-1 bg-white border rounded-md border-gray-300 p-2 ">
							Send to all
						</div>
					</div>
				)}
				{details?.metadata?.target?.tags?.length > 0 && (
					<div>
						<div className="flex text-sm items-center gap-x-1 bg-white border rounded-md border-gray-300 p-2 ">
							Categories:{" "}
							{details?.metadata?.target?.tags?.map((t: string) => {
								return (
									<div
										key={t}
										className="p-1 bg-gray-800 px-2 text-white rounded-md"
									>
										{t}
									</div>
								)
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
