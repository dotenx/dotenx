import { Button, Code } from '@mantine/core'
import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { API_URL, getProfile, getProject, getUserManagementData, QueryKey } from '../api'
import { Modals, useModal } from '../features/hooks'
import { ContentWrapper, Drawer, Endpoint, Loader, Table } from '../features/ui'

export default function UserManagementPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}

function UMTableContent({ projectName }: { projectName: string }) {
	const { data: projectDetails, isLoading: projectDetailsLoading } = useQuery(
		QueryKey.GetProject,
		() => getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag ?? ''
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		QueryKey.GetUserManagementData,
		() => getUserManagementData(projectTag),
		{ enabled: !!projectTag }
	)
	const tableData = usersData?.data ?? []

	return (
		<ContentWrapper>
			<Table
				loading={projectDetailsLoading || usersDataLoading}
				title="User Management"
				emptyText="Your users list will display here."
				columns={[
					{
						Header: 'Name',
						accessor: 'fullname',
					},
					{
						Header: 'Username',
						accessor: 'email',
					},
					{
						Header: 'Created',
						accessor: 'created_at',
						Cell: ({ value }: { value: string }) => (
							<div>
								<span>{format(new Date(value.split('+')[0]), 'yyyy/MM/dd')}</span>
							</div>
						),
					},
					{
						Header: 'User ID',
						accessor: 'account_id',
					},
				]}
				data={tableData}
				actionBar={<ActionBar projectTag={projectTag} />}
			/>
		</ContentWrapper>
	)
}

const registerExample = {
	email: 'example@email.com',
	password: 'abcdefg1234',
	fullname: 'John Smith',
}

const loginExample = {
	email: 'example@email.com',
	password: 'abcdefg1234',
}

function ActionBar({ projectTag }: { projectTag: string }) {
	const modal = useModal()
	const profileQuery = useQuery(QueryKey.GetProfile, getProfile)
	const accountId = profileQuery.data?.data.account_id
	const profileExample = {
		account_id: accountId,
		tp_account_id: '********-****-****-****-************',
	}

	if (profileQuery.isLoading) return <Loader />

	return (
		<>
			<div className="flex gap-2">
				<Button component={Link} to="user-groups">
					User Groups
				</Button>
				<Button onClick={() => modal.open(Modals.UserManagementEndpoint)}>Endpoints</Button>
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
						url={`${API_URL}/profile`}
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
				</div>
			</Drawer>
		</>
	)
}
