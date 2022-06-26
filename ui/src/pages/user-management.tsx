import { useQuery } from 'react-query'
import { Navigate, useParams } from 'react-router-dom'
import { getUserManagementData, getProject, QueryKey } from '../api'
import { Table } from '../features/ui'
import { format } from 'date-fns'

export default function UserManagementPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}
function UMTableContent({ projectName }: { projectName: string }) {
	const { data: projectDetails, isLoading } = useQuery(QueryKey.GetProject, () =>
		getProject(projectName)
	)
	const projectTag = projectDetails?.data.tag
	const { data: usersData } = useQuery(
		QueryKey.GetUserManagementData,
		() => getUserManagementData(projectTag || ''),
		{
			enabled: !!projectTag,
		}
	)
	const tableData = usersData?.data

	return (
		<div className="grow">
			<div className="px-32 py-16">
				<Table
					loading={isLoading}
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
