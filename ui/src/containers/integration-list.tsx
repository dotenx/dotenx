/** @jsxImportSource @emotion/react */
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteIntegration, getIntegrations, QueryKey } from '../api'
import { Item, Table } from '../features/ui'
import { getDisplayText } from '../utils'

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
			headers={['Name', 'Type']}
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
