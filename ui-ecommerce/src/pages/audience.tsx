import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { RiDeleteBin2Line } from "react-icons/ri"
import { useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { IoMail, IoReload } from "react-icons/io5"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { AudienceStats } from "./analytics"
import { ActionIcon, Button, Modal, Checkbox, Tooltip } from "@mantine/core"
import _ from "lodash"
import {
	getIntegrations,
	runCustomQuery,
	QueryKey,
	getEmailPipelineList,
	deleteEmailPipeline,
} from "../api"
import { IntegrationForm } from "../features/app/addIntegrationForm"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

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
	const modal = useModal()
	const [openModal, setOpenModal] = useState(false)
	const query = useQuery([QueryKey.GetIntegrations], getIntegrations)
	const client = useQueryClient()
	const noIntegration =
		(
			query?.data?.data
				.map((d) => {
					if (["sendGrid"].includes(d.type)) return d.type
				})
				.filter((d) => d !== undefined) || []
		).length === 0

	return (
		<div className="flex gap-x-5 items-center">
			{noIntegration && query.isSuccess && (
				<div className="text-sm p-1 px-2 bg-blue-50 rounded text-gray-600 flex items-center gap-x-2">
					You must connect your account to SendGrid to send emails{" "}
					<Button onClick={() => setOpenModal(true)} color="blue" size="xs">
						Connect
					</Button>
				</div>
			)}
			<Button
				disabled={noIntegration}
				leftIcon={<IoMail />}
				onClick={() => modal.open(Modals.UserManagementEndpoint)}
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
		</div>
	)
}

function MembersTab() {
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const [currentPage, setCurrentPage] = useState(1)
	const membersQuery = useQuery(
		["get-members", projectTag],
		() => runCustomQuery(projectTag, "SELECT DISTINCT email FROM orders;"),
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
								<FaUserCircle className="h-5 w-5" />
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

function SentEmailsTab() {
	// const emails = [
	// 	{
	// 		subject: "Subject",
	// 		date: "Date",
	// 		recipients: "Recipients",
	// 		views: "Views",
	// 		clicks: "Clicks",
	// 		opens: "Opens",
	// 		bounces: "Bounces",
	// 	},
	// ]

	return (
		<Table
			columns={[
				{
					Header: "name",
					accessor: "name",
				},
				{
					Header: "Subject",
					accessor: "subject",
				},
				{
					Header: "Date",
					accessor: "date",
				},
			]}
			data={[] as any}
		/>
	)
}

function SchedulesTab() {
	const schedules = [
		{
			subject: "Subject",
			last_edited: "Last Edited",
		},
	]
	const projectQuery = useGetProjectTag()
	console.log(projectQuery.projectName)
	const projectTag = projectQuery.projectTag
	const { mutate, isLoading } = useMutation(
		(pipelineName: string) =>
			deleteEmailPipeline({ pipelineName, projectName: projectQuery.projectName }),
		{
			onSuccess: () => {
				toast("Product added successfully", { type: "success", autoClose: 2000 })
			},
		}
	)
	const query = useQuery(
		[QueryKey.GetEmailPipelineList],
		() => getEmailPipelineList({ tag: projectTag }),
		{ enabled: !!projectTag }
	)
	const scheduleTableData = query?.data?.data.pipelines
	console.log(scheduleTableData)
	return (
		<Table
			columns={[
				{
					Header: "Name",
					accessor: "name",
				},
				{
					Header: "Subject",
					accessor: "",
					Cell: ({ row }: { row: any }) => {
						return <span>{row.original.metadata.subject}</span>
					},
				},

				{
					Header: "Target",
					accessor: "",
					Cell: ({ row }: { row: any }) => {
						console.log(row?.original?.metadata?.target)
						if (row?.original?.metadata?.target?.send_to_all)
							return (
								<div className="flex items-center ">
									<div className="mr-1">Send to all</div>
								</div>
							)
						if (row?.original?.metadata?.target?.product_ids !== null)
							return (
								<div className="flex items-center ">
									<div className="mr-1">Product IDs:</div>
									{row?.original?.metadata?.target?.product_ids?.map(
										(id: number) => {
											return (
												<div className="mx-[2px] bg-gray-800 text-white rounded p-1 px-[6px] ">
													{id}
												</div>
											)
										}
									)}
								</div>
							)
						if (row?.original?.metadata?.target?.tags !== null)
							return (
								<div className="flex items-center ">
									<div className="mr-1">Tags:</div>
									{row?.original?.metadata?.target?.tags?.map((tag: string) => {
										return (
											<div className="mx-[2px] bg-gray-800 text-white rounded p-1 px-[6px] ">
												{tag}
											</div>
										)
									})}
								</div>
							)
						else return <span>-</span>
					},
				},
				{
					Header: "Active",
					accessor: "is_active",
					Cell: ({ value }: { value: boolean }) => {
						return (
							<Tooltip
								withArrow
								openDelay={700}
								label={`${value ? "Deactivate" : "Activate"} email pipeline`}
							>
								<div className="w-fit">
									<Checkbox
										className="ml-4"
										name="is_active"
										checked={value}
										onClick={() => {
											console.log(!value)
										}}
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
							<Tooltip withArrow openDelay={500} label="Delete email pipeline">
								<div className="w-fit">
									<RiDeleteBin2Line
										onClick={() => mutate(row.original.name)}
										className={`cursor-pointer h-5 w-5 ${
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
	)
}
