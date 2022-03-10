import { useQuery } from 'react-query'
import { getIntegrations, QueryKey } from '../api'
import { Detail, Item, Table } from '../components/table'
import { getDisplayText } from '../utils'

export function IntegrationList() {
	const query = useQuery(QueryKey.GetIntegrations, getIntegrations)
	const integrations = query.data?.data

	return (
		<Table
			title="Integrations"
			headers={['Name', 'Type']}
			items={integrations?.map((integration) => (
				<Item
					key={integration.name}
					values={[integration.name, getDisplayText(integration.type)]}
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
