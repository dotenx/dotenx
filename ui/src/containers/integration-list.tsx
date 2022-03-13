import { useMutation, useQuery, useQueryClient } from 'react-query'
import { deleteIntegration, getIntegrations, QueryKey } from '../api'
import { Detail, Item, Table } from '../components/table'
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
				>
					<Detail label="Access token" value={integration.access_token} />
					<Detail label="Key" value={integration.key} />
					<Detail label="Secret" value={integration.secret} />
					<Detail label="URL" value={integration.url} />
				</Item>
			))}
		/>
	)
}
