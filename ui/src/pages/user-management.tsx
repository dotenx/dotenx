import { Button, Code } from "@mantine/core"
import { format } from "date-fns"
import { useState } from "react"
import { IoReload } from "react-icons/io5"
import { useQuery, useQueryClient } from "react-query"
import { Navigate, useParams } from "react-router-dom"
import { API_URL, getProfile, getProject, getUserManagementData, QueryKey } from "../api"
import { Modals, useModal } from "../features/hooks"
import { Content_Wrapper, Drawer, Endpoint, Header, Loader, Table } from "../features/ui"
import UserGroupsWrapper from "./user-groups"

export default function UserManagementPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const [currentPage, setCurrentPage] = useState(1)
	const [activeTab, setActiveTab] = useState<"users" | "user groups">("users")

	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ""
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		[QueryKey.GetUserManagementData, projectTag, currentPage],
		() => getUserManagementData(projectTag, currentPage),
		{ enabled: !!projectTag }
	)
	const tableData = usersData?.data?.rows ?? []

	const nPages = Math.ceil((usersData?.data?.totalRows as number) / 10)

	const helpDetails = {
		title: "You can add manage the users of your application and control their access",
		description:
			"The list of users of your application and the endpoints to manage them are provided here. You can use user groups to control the access of your users.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/files",
	}

	return (
		<div>
			<Header
				tabs={["users", "user groups"]}
				headerLink={`/builder/projects/${projectName}/user-management`}
				title={"User Management"}
				activeTab={activeTab}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
			>
				<ActionBar projectTag={projectTag} />
			</Header>
			<Content_Wrapper>
				{activeTab === "users" && (
					<Table
						withPagination
						currentPage={currentPage}
						nPages={nPages}
						setCurrentPage={setCurrentPage}
						helpDetails={helpDetails}
						loading={projectDetailsLoading || usersDataLoading}
						emptyText="Your users will be displayed here"
						columns={[
							{
								Header: "Name",
								accessor: "fullname",
							},
							{
								Header: "Username",
								accessor: "email",
							},
							{
								Header: "Created",
								accessor: "created_at",
								Cell: ({ value }: { value: string }) => (
									<div>
										<span>
											{format(new Date(value.split("+")[0]), "yyyy/MM/dd")}
										</span>
									</div>
								),
							},
							{
								Header: "Group",
								accessor: "user_group",
							},
							{
								Header: "User ID",
								accessor: "account_id",
							},
						]}
						data={tableData}
					/>
				)}
				{activeTab === "user groups" && <UserGroupsWrapper />}
			</Content_Wrapper>
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
	const queryClient = useQueryClient()

	if (profileQuery.isLoading) return <Loader />

	return (
		<>
			<div className="flex flex-wrap gap-2">
				<Button
					leftIcon={<IoReload />}
					type="button"
					onClick={() => queryClient.invalidateQueries(QueryKey.GetUserManagementData)}
				>
					Refresh
				</Button>
				<Button
					className="endpoints"
					onClick={() => modal.open(Modals.UserManagementEndpoint)}
				>
					Endpoints
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
