import { Button } from '@mantine/core'
import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteIntegration, getIntegrations, QueryKey } from '../../api'
import { Modals, useModal } from '../hooks'
import { DeleteButton, Table } from '../ui'

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
			loading={query.isLoading}
			actionBar={<ActionBar />}
			columns={[
				{ Header: 'Name', accessor: 'name' },
				{ Header: 'Type', accessor: 'type' },
				{
					Header: 'Action',
					id: 'action',
					accessor: 'name',
					Cell: ({ value }: { value: string }) => (
						<DeleteButton
							onClick={() => deleteMutation.mutate(value)}
							loading={deleteMutation.isLoading}
						/>
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
		<Button
			leftIcon={<IoAdd className="text-xl" />}
			onClick={() => modal.open(Modals.NewIntegration)}
		>
			New integration
		</Button>
	)
}
