import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'

export default function InteractionsPage() {
	const { projectName = '' } = useParams()
	const automationsQuery = useQuery(QueryKey.GetAutomations, () => getAutomations(projectName))
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
