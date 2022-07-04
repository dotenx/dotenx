import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { API_URL, getProject, getUserManagementData, QueryKey } from '../api'
import { Endpoint } from '../features/database'
import { Modals, useModal } from '../features/hooks'
import { Button, JsonCode, Modal, Table } from '../features/ui'

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
		<div className="grow">
			<div className="px-32 py-16">
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
									<span>
										{format(new Date(value.split('+')[0]), 'yyyy/MM/dd')}
									</span>
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
			</div>
		</div>
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

	return (
		<>
			<Button variant="outlined" onClick={() => modal.open(Modals.UserManagementEndpoint)}>
				Endpoint
			</Button>
			<Modal kind={Modals.UserManagementEndpoint} title="Endpoint" fluid size="lg">
				<div className="px-4 pt-6 pb-10 space-y-4">
					<Endpoint
						label="Sign up a user"
						url={`${API_URL}/user/management/project/${projectTag}/register`}
						kind="POST"
					/>
					<JsonCode code={JSON.stringify(registerExample, null, 2)} />
				</div>
				<div className="px-4 pt-6 pb-10 space-y-4">
					<Endpoint
						label="Sign in"
						url={`${API_URL}/user/management/project/${projectTag}/login`}
						kind="POST"
					/>
					<JsonCode code={JSON.stringify(loginExample, null, 2)} />
				</div>
			</Modal>
		</>
	)
}
