import { Button, Code } from "@mantine/core"
import { format } from "date-fns"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import {
	API_URL,
	getMembersSummary,
	getProductsSummary,
	getProfile,
	getProject,
	getUserManagementData,
	QueryKey,
} from "../api"
import { Modals, useModal } from "../features/hooks"
import { Content_Wrapper, Drawer, Endpoint, Header, Loader, Table } from "../features/ui"
import { AudienceStats } from "./analytics"
import UserGroupsWrapper from "./user-groups"

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
				<ActionBar projectTag={projectTag} />
			</Header>
			<Content_Wrapper>
				{activeTab === "members" && <MembersTab projectTag={projectTag} projectDetailsLoading={projectDetailsLoading} />}
				{activeTab === "sent emails" && <SentEmailsTab />}
				{activeTab === "drafts" && <DraftsTab />}
			</Content_Wrapper>
		</div>
	)
}

function MembersTab({ projectTag, projectDetailsLoading }: { projectTag: string, projectDetailsLoading: boolean }) {
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

const registerExample = {
	email: "example@email.com",
	password: "abcdefg1234",
	fullname: "John Smith",
}

const loginExample = {
	email: "example@email.com",
	password: "abcdefg1234",
}

function ActionBar({ projectTag }: { projectTag: string }) {
	const modal = useModal()
	const profileQuery = useQuery(
		[QueryKey.GetProfile, projectTag],
		() => getProfile({ projectTag }),
		{ enabled: !!projectTag }
	)
	const accountId = profileQuery.data?.data.account_id
	const profileExample = {
		account_id: accountId,
		created_at: "2022-11-25 20:59:13.675894187 +0000 UTC m=+171.884849553",
		email: "example.email.com",
		full_name: "John Smith",
		user_group: "users",
		tp_account_id: "********-****-****-****-************",
	}

	if (profileQuery.isLoading) return <Loader />

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button
					// todod: make the button black
					onClick={() => modal.open(Modals.UserManagementEndpoint)}
				>
					Send New Email
				</Button>
			</div>
			<Drawer kind={Modals.UserManagementEndpoint} title="Endpoint">
				<div className="space-y-8">
					<Endpoint
						label="Sign up a user"
						url={`${API_URL}/user/management/project/${projectTag}/register`}
						method="POST"
						code={registerExample}
					/>
					<Endpoint
						label="Sign in"
						url={`${API_URL}/user/management/project/${projectTag}/login`}
						method="POST"
						code={loginExample}
					/>
					<Endpoint
						label="Get user profile"
						url={`${API_URL}/profile/project/${projectTag}`}
						method="GET"
						code={profileExample}
						isResponse
						description={
							<p>
								<Code>tp_account_id</Code> is the user&apos;s account ID.
							</p>
						}
					/>
					<Endpoint
						label="Authenticate with provider"
						url={`${API_URL}/user/management/project/${projectTag}/provider/:provider_name/authorize`}
						method="GET"
					/>
					<Endpoint
						label="Set user group"
						url={`${API_URL}/user/group/management/project/${projectTag}/userGroup/name/:group_name`}
						method="POST"
						code={{
							account_id: "account_id",
						}}
					/>
				</div>
			</Drawer>
		</>
	)
}

function Stats() {
	const totalRevenue = 130
	const last24 = 10
	const mrr = 100

	return (
		<div className="grid lg:grid-cols-3 md-grid-cols-2 gap-x-2 gap-y-2">
			<StatBlock title="Total Revenue" value={`$${totalRevenue}`} defaultValue="$0" />
			<StatBlock title="Last 24h" value={`$${last24}`} defaultValue="$0" />
			<StatBlock title="MRR" value={`$${mrr}`} defaultValue="$0" />
		</div>
	)
}

function StatBlock({
	title,
	value,
	defaultValue,
}: {
	title: string
	value: string
	defaultValue: string
}) {
	return (
		<div className="bg-white rounded-lg p-4 border-solid border-2 border-gray-600">
			<p className="text-gray-500 text-sm pb-2">{title}</p>
			<p className="text-2xl font-bold">{value || defaultValue}</p>
		</div>
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
