import { format } from 'date-fns'
import { useQuery } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { getProject, getUserManagementData, QueryKey } from '../api'
import { Table } from '../features/ui'

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
	const projectTag = projectDetails?.data.tag
	const { data: usersData, isLoading: usersDataLoading } = useQuery(
		QueryKey.GetUserManagementData,
		() => getUserManagementData(projectTag || ''),
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
				/>
			</div>
		</div>
	)
}
