import { useQuery } from 'react-query'
import { Automation, getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'

export default function AutomationsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const automations = automationsQuery.data?.data.filter(isAutomation)

	return (
		<AutomationList
			automations={automations}
			loading={automationsQuery.isLoading}
			title="Automations"
			kind="automation"
		/>
	)
}

const isAutomation = (automation: Automation) =>
	!automation.is_template && !automation.is_interaction
