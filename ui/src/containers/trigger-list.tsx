import { useQuery } from 'react-query'
import { getTriggers, QueryKey } from '../api'
import { getDisplayText } from '../utils'

export function TriggerList() {
	const query = useQuery(QueryKey.GetTriggers, getTriggers)
	const triggers = query.data?.data

	return (
		<div>
			<h2>Triggers</h2>
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
			{triggers?.map((trigger) => (
				<div
					key={trigger.name}
					css={{
						padding: 8,
						backgroundColor: '#eeeeee44',
						borderRadius: 4,
						margin: 12,
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
					}}
				>
					<div>{trigger.name}</div>
					<div>{getDisplayText(trigger.type)}</div>
				</div>
			))}
		</div>
	)
}
