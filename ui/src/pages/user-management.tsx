import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { API_URL, getProject, getUserManagementData, QueryKey } from '../api'
import { EndpointWithBody } from '../features/database'
import { Modals, useModal } from '../features/hooks'
import { Button, ContentWrapper, Drawer, Table } from '../features/ui'

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
				title="User management"
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

const profileExample = {
	account_id: '123456',
	tp_account_id: '321eaabe-9b36-4c99-a57e-1e77e31f48b5',
}

function ActionBar({ projectTag }: { projectTag: string }) {
	const modal = useModal()

	return (
		<>
			<Button variant="outlined" onClick={() => modal.open(Modals.UserManagementEndpoint)}>
				Endpoint
			</Button>
			<Drawer kind={Modals.UserManagementEndpoint} title="Endpoint">
				<div className="space-y-8">
					<EndpointWithBody
						label="Sign up a user"
						url={`${API_URL}/user/management/project/${projectTag}/register`}
						kind="POST"
						code={registerExample}
					/>
					<EndpointWithBody
						label="Sign in"
						url={`${API_URL}/user/management/project/${projectTag}/login`}
						kind="POST"
						code={loginExample}
					/>
					<EndpointWithBody
						label="Get user profile"
						url={`${API_URL}/profile`}
						kind="GET"
						code={profileExample}
						isResponse
					/>
				</div>
			</Drawer>
		</>
	)
}
