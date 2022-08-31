import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'

export default function TemplatesPage() {
	const { projectName = '' } = useParams()
	const automationsQuery = useQuery([QueryKey.GetAutomations, projectName], () =>
		getAutomations(projectName)
	)
	const templates = automationsQuery.data?.data.filter((automation) => automation.is_template)

	return (
		<AutomationList
			automations={templates}
			loading={automationsQuery.isLoading}
			title="Automation Templates"
			kind="template"
		/>
	)
}
