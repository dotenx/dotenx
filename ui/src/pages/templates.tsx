import { useQuery } from 'react-query'
import { getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'

export default function TemplatesPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, getAutomations)
	const templates = automationsQuery.data?.data.filter((automation) => automation.is_template)

	return (
		<AutomationList
			automations={templates}
			loading={automationsQuery.isLoading}
			title="Templates"
			kind="template"
		/>
	)
}
