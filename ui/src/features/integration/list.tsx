import { IoAdd } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteIntegration, getIntegrations, QueryKey } from '../../api'
import { getDisplayText } from '../../utils'
import { Modals, useModal } from '../hooks'
import { Item, Table } from '../ui'

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
		<button
			className="flex items-center gap-2 px-3 py-2 text-white transition rounded-lg bg-rose-600 hover:bg-rose-700"
			onClick={() => modal.open(Modals.NewIntegration)}
		>
			<IoAdd className="text-2xl" />
			New integration
		</button>
	)
}
