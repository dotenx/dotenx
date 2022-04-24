import { IoAdd } from 'react-icons/io5'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { useDeleteAutomation } from '../features/automation/use-delete'
import { useNewAutomation } from '../features/automation/use-new'
import { Button, DeleteButton, Table } from '../features/ui'

export default function AutomationsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const automations = automationsQuery.data?.data
	const deleteMutation = useDeleteAutomation()

	return (
		<div className="grow">
			<div className="px-32 py-16 grow">
				<Table
					title="Automations"
					emptyText="You have no automation yet, try adding one."
					actionBar={<NewAutomation />}
					columns={[
						{
							Header: 'Name',
							accessor: 'name',
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
							accessor: 'name',
							Cell: ({ value }: { value: string }) => (
								<DeleteButton onClick={() => deleteMutation.mutate(value)} />
							),
						},
					]}
					data={automations}
				/>
			</div>
		</div>
	)
}

function NewAutomation() {
	const newAutomation = useNewAutomation()

	return (
		<Button className="max-w-min" onClick={newAutomation}>
			<IoAdd className="text-2xl" />
			New Automation
		</Button>
	)
}
