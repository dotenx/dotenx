import { useQuery } from 'react-query'
import { getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'

export default function InteractionsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const interactions = automationsQuery.data?.data.filter(
		(automation) => automation.is_interaction
	)

	return (
		<AutomationList
			automations={interactions}
			loading={automationsQuery.isLoading}
			title="Interactions"
			kind="interaction"
		/>
	)
}
