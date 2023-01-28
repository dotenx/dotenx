import { ActionIcon, Button } from "@mantine/core"
import { useState } from "react"
import { IoMail, IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { getMembersSummary, QueryKey } from "../api"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Table } from "../features/ui"
import { useGetProjectTag } from "../features/ui/hooks/use-get-project-tag"
import { AudienceStats } from "./analytics"

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
		<Button
			leftIcon={<IoMail />}
			// todo: make the button black
			onClick={() => modal.open(Modals.UserManagementEndpoint)}
		>
			Send New Email
		</Button>
	)
}

function MembersTab() {
	const projectQuery = useGetProjectTag()
	const projectTag = projectQuery.projectTag
	const [currentPage, setCurrentPage] = useState(1)
	const membersQuery = useQuery(
		[QueryKey.GetMembersSummary, projectTag, currentPage],
		() => getMembersSummary(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const members = membersQuery.data?.data?.rows ?? []
	const nPages = Math.ceil((membersQuery.data?.data?.totalRows as number) / 10)
	const queryClient = useQueryClient()
	const refetchMembers = () => queryClient.invalidateQueries(QueryKey.GetMembersSummary)

	return (
		<div>
			<div className="my-10">
				<AudienceStats />
			</div>
			{/* TODO: on row click => open slider from right and show the orders of the user */}
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
					},
					{
						Header: "Name",
						accessor: "name",
					},
					{
						Header: "Total Orders",
						accessor: "total_orders",
					},
					{
						Header: "Monthly Revenue",
						accessor: "monthly_revenue",
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
		//give all the data here
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
