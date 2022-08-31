import { useQuery } from 'react-query'
import { Automation, getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'
import { AUTOMATION_PROJECT_NAME } from './automation'

export default function AutomationsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, () =>
		getAutomations(AUTOMATION_PROJECT_NAME)
	)
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
