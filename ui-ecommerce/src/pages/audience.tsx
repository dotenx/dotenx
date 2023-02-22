import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FaUserCircle } from "react-icons/fa"
import { IoMail, IoReload } from "react-icons/io5"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { AudienceStats } from "./analytics"
import { ActionIcon, Button, Modal } from "@mantine/core"
import _ from "lodash"
import { getIntegrations, runCustomQuery, QueryKey } from "../api"
import { IntegrationForm } from "../features/app/addIntegrationForm"
import { toast } from "react-toastify"
import { Link } from "react-router-dom"

export function AudiencePage() {
	const [activeTab, setActiveTab] = useState<"members" | "sent emails" | "schedules">("members")

	return (
		<div>
			<Header
				tabs={["members", "sent emails", "schedules"]}
				title="Audience"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "members" && <MembersTab />}
				{activeTab === "sent emails" && <SentEmailsTab />}
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

	// todo: add edit, and delete buttons
	return (
		<Table
			columns={[
				{
					Header: "Subject",
					accessor: "subject",
				},
				{
					Header: "Last Edited",
					accessor: "last_edited",
				},
			]}
			data={schedules}
		/>
	)
}
