import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomations, QueryKey } from '../api'
import { AutomationList } from '../features/automation'
import { HelpDetails } from '../features/ui/help-popover'

export default function InteractionsPage() {
	const { projectName = '' } = useParams()
	const automationsQuery = useQuery(QueryKey.GetAutomations, () => getAutomations(projectName))
	const interactions = automationsQuery.data?.data.filter(
		(automation) => automation.is_interaction
	)

	const helpDetails: HelpDetails = {
		title: 'Use Interactions to add custom logic to your applications',
		description:
			'An interaction gives you a way to implement custom workflows exposed as API endpoint.',
		videoUrl: 'https://www.youtube.com/embed/_5GRK17KUrg',
		tutorialUrl: 'https://docs.dotenx.com/docs/builder_studio/interactions',
	}

	return (
		<AutomationList
			helpDetails={helpDetails}
			automations={interactions}
			loading={automationsQuery.isLoading}
			title="Interactions"
			kind="interaction"
		/>
	)
}
