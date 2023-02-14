import { ActionIcon, Button } from "@mantine/core"
import { useQuery, useQueryClient } from "react-query"
import { useState } from "react"
import { IoMail, IoReload } from "react-icons/io5"
import { QueryKey, runCustomQuery } from "../api"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { AudienceStats } from "./analytics"
import { FaUserCircle } from "react-icons/fa"

export function AudiencePage() {
	const [activeTab, setActiveTab] = useState<"members" | "sent emails" | "drafts">("members")

	return (
		<div>
			<Header
				tabs={["members", "sent emails", "drafts"]}
				title="Audience"
				activeTab={activeTab}
				onTabChange={setActiveTab}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "members" && <MembersTab />}
				{activeTab === "sent emails" && <SentEmailsTab />}
				{activeTab === "drafts" && <DraftsTab />}
			</ContentWrapper>
		</div>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<Button leftIcon={<IoMail />} onClick={() => modal.open(Modals.UserManagementEndpoint)}>
			Send Email
		</Button>
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
	const emails = [
		{
			subject: "Subject",
			date: "Date",
			recipients: "Recipients",
			views: "Views",
			clicks: "Clicks",
			opens: "Opens",
			bounces: "Bounces",
		},
	]

	return (
		<Table
			columns={[
				{
					Header: "Subject",
					accessor: "subject",
				},
				{
					Header: "Date",
					accessor: "date",
				},
				{
					Header: "Recipients",
					accessor: "recipients",
				},
				{
					Header: "Views",
					accessor: "views",
				},
				{
					Header: "Clicks",
					accessor: "clicks",
				},
				{
					Header: "Opens",
					accessor: "opens",
				},
				{
					Header: "Bounces",
					accessor: "bounces",
				},
			]}
			data={emails}
		/>
	)
}

function DraftsTab() {
	const drafts = [
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
			data={drafts}
		/>
	)
}
