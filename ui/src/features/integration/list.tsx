import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteIntegration, getIntegrations, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { Button, DeleteButton, Table } from '../ui'

export function IntegrationList() {
	const client = useQueryClient()
	const query = useQuery(QueryKey.GetIntegrations, getIntegrations)
	const deleteMutation = useMutation(deleteIntegration, {
		onSuccess: () => client.invalidateQueries(QueryKey.GetIntegrations),
	})
	const integrations = query.data?.data

	return (
		<Table
			title="Integrations"
			emptyText="You have no integration yet, try adding one."
			actionBar={<ActionBar />}
			columns={[
				{ Header: 'Name', accessor: 'name' },
				{ Header: 'Type', accessor: 'type' },
				{
					Header: 'Action',
					id: 'action',
					accessor: 'name',
					Cell: ({ value }: { value: string }) => (
						<DeleteButton onClick={() => deleteMutation.mutate(value)} />
					),
				},
			]}
			data={integrations}
		/>
	)
}

function ActionBar() {
	const modal = useModal()

	return (
		<Button className="max-w-min" onClick={() => modal.open(Modals.NewIntegration)}>
			<IoAdd className="text-2xl" />
			New integration
		</Button>
	)
}
