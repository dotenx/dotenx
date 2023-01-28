import { Button } from "@mantine/core"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import { getMembersSummary, getProject, QueryKey } from "../api"
import { Modals, useModal } from "../features/hooks"
import { ContentWrapper, Header, Table } from "../features/ui"
import { AudienceStats } from "./analytics"

export default function AudiencePage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const [activeTab, setActiveTab] = useState<"members" | "sent emails" | "drafts">("members")

	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ""

	return (
		<div>
			<Header
				tabs={["members", "sent emails", "drafts"]}
				title={"Audience"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar />
			</Header>
			<ContentWrapper>
				{activeTab === "members" && (
					<MembersTab
						projectTag={projectTag}
						projectDetailsLoading={projectDetailsLoading}
					/>
				)}
				{activeTab === "sent emails" && <SentEmailsTab />}
				{activeTab === "drafts" && <DraftsTab />}
			</ContentWrapper>
		</div>
	)
}

function MembersTab({
	projectTag,
	projectDetailsLoading,
}: {
	projectTag: string
	projectDetailsLoading: boolean
}) {
	const [currentPage, setCurrentPage] = useState(1)

	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		[QueryKey.GetMembersSummary, projectTag, currentPage],
		() => getMembersSummary(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const tableData = usersData?.data?.rows ?? []

	const nPages = Math.ceil((usersData?.data?.totalRows as number) / 10)
	const queryClient = useQueryClient()

	return (
		<div className="flex flex-col">
			<div className="my-10">
				<AudienceStats />
			</div>
			{/* TODO: on row click => open slider from right and show the orders of the user */}
			<Table
				withPagination
				currentPage={currentPage}
				nPages={nPages}
				setCurrentPage={setCurrentPage}
				loading={projectDetailsLoading || usersDataLoading}
				emptyText="No members yet"
				actionBar={
					<Button
						leftIcon={<IoReload />}
						type="button"
						onClick={() => queryClient.invalidateQueries(QueryKey.GetMembersSummary)}
					>
						Refresh
					</Button>
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
				data={tableData}
			/>
		</div>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<Button
			// todod: make the button black
			onClick={() => modal.open(Modals.UserManagementEndpoint)}
		>
			Send New Email
		</Button>
	)
}

function SentEmailsTab() {
	const tableData = [
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
		<div className="w-full mt-4">
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
				data={tableData}
			/>
		</div>
	)
}

function DraftsTab() {
	const tableData = [
		//give all the data here
		{
			subject: "Subject",
			last_edited: "Last Edited",
		},
	]

	// todo: add edit, and delete buttons
	return (
		<div className="flex flex-col">
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
				data={tableData}
			/>
		</div>
	)
}
