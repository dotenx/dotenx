import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteIntegration, getIntegrations, QueryKey } from '../../api'
import { getDisplayText } from '../../utils'
import { Modals, useModal } from '../hooks'
import { Button, Item, Table } from '../ui'

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
			headers={['Name', 'Type', 'Action']}
			items={integrations?.map((integration) => (
				<Item
					key={integration.name}
					values={[integration.name, getDisplayText(integration.type)]}
					onDelete={() => deleteMutation.mutate(integration.name)}
				/>
			))}
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
