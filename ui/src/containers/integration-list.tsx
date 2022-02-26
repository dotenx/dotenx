import { useQuery } from 'react-query'
import { getAccountIntegrations, QueryKey } from '../api'
import { getDisplayText } from '../utils'

export function IntegrationList() {
	const query = useQuery(QueryKey.GetAccountIntegrations, getAccountIntegrations)

	return (
		<div>
			<h2>Integrations</h2>
			<div
				css={{
					padding: 8,
					margin: 12,
					marginBottom: 16,
					display: 'grid',
					gridTemplateColumns: 'repeat(3, 1fr)',
					borderBottom: '1px solid #999999',
				}}
			>
				<div>Name</div>
				<div>Type</div>
			</div>
			{query.data?.data.map((integration) => (
				<div
					key={integration.name}
					css={{
						padding: 8,
						backgroundColor: '#eeeeee44',
						borderRadius: 4,
						margin: 12,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
					}}
				>
					<div>{integration.name}</div>
					<div>{getDisplayText(integration.type)}</div>
				</div>
			))}
		</div>
	)
}
