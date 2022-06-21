import { IoAdd, IoCodeDownload } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { useDeleteAutomation } from '../features/automation/use-delete'
import { useNewAutomation } from '../features/automation/use-new'
import { Button, DeleteButton, Table } from '../features/ui'
import { TiUserAdd } from 'react-icons/ti'

export default function AuthenticationPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const automations = automationsQuery.data?.data
	const dataSample = [
		{
			userName: 'mehdi@utopiops.com',
			is_active: true,
			created: '6/19/2022',
			userId: 987654321,
		},
		{
			userName: 'mehdi@utopiops.com',
			is_active: true,
			created: '6/19/2022',
			userId: 987654321,
		},
		{
			userName: 'mehdi@utopiops.com',
			is_active: true,
			created: '6/19/2022',
			userId: 987654321,
		},
		{
			userName: 'mehdi@utopiops.com',
			is_active: true,
			created: '6/19/2022',
			userId: 987654321,
		},
	]
	return (
		<div className="grow">
			<div className="px-32 py-16">
				<Table
					title="Authentication"
					emptyText="Your users list will display here."
					loading={automationsQuery.isLoading}
					actionBar={<NewUser />}
					columns={[
						{
							Header: 'Username',
							accessor: 'userName',
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
							accessor: 'created',
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
							Header: 'logged in',
							accessor: 'is_active',
							Cell: ({ value }: { value: boolean }) =>
								value ? (
									<span className="px-2 py-1 text-xs font-extrabold text-green-600 rounded-md bg-green-50">
										Active
									</span>
								) : (
									<span className="px-2 py-1 text-xs font-extrabold text-gray-600 rounded-md bg-gray-50">
										Inactive
									</span>
								),
						},
						{
							Header: 'User ID',
							accessor: 'userId',
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
							Header: 'Action',
							id: 'action',
							accessor: 'userName',
							Cell: DeletionCell,
						},
					]}
					data={dataSample}
				/>
			</div>
		</div>
	)
}

function NewUser() {
	return (
		<div className="flex gap-4">
			<Button className="max-w-min" onClick={() => alert('new user added!')}>
				<TiUserAdd className="text-2xl" />
				New User
			</Button>
		</div>
	)
}

function DeletionCell({ value }: { value: string }) {
	const deleteMutation = useDeleteAutomation()

	return (
		<DeleteButton
			loading={deleteMutation.isLoading}
			onClick={() => deleteMutation.mutate(value)}
		/>
	)
}
