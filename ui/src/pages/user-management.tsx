import { useQuery } from 'react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getUserManagementData, getProject, QueryKey } from '../api'
import { Loader, Table } from '../features/ui'
import { useState } from 'react'
import { format } from 'date-fns'

export default function UserManagementPage() {
	const { projectName } = useParams()
	if (!projectName) return <Navigate to="/" replace />
	return <UMTableContent projectName={projectName} />
}
function UMTableContent({ projectName }: { projectName: string }) {
	const [projectTag, setProjectTag] = useState('')

	useQuery(QueryKey.GetProject, () => getProject(projectName), {
		onSuccess: (project) => {
			setProjectTag(project.data.tag)
		},
	})

	const { isFetched, data: usersData } = useQuery(
		QueryKey.GetUserManagementData,
		() => getUserManagementData(projectTag),
		{
			enabled: projectTag !== '',
		}
	)
	const tableData = usersData?.data
	if (!isFetched) return <Loader />

	return (
		<div className="grow">
			<div className="px-32 py-16">
				<Table
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
							Cell: ({ value }: { value: string }) => (
								<Link
									className="hover:underline underline-offset-2"
									to={`/automations/${value}`}
								>
									{value}
								</Link>
							),
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
							Cell: ({ value }: { value: string }) => (
								<Link
									className="hover:underline underline-offset-2"
									to={`/automations/${value}`}
								>
									{value}
								</Link>
							),
						},
					]}
					data={tableData}
				/>
			</div>
		</div>
	)
}
