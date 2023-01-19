import { useQuery } from "react-query"
import { useParams } from "react-router-dom"
import { getAutomations, QueryKey } from "../api"
import { AutomationList } from "../features/automation"
import { HelpDetails } from "../features/ui/help-popover"

export default function TemplatesPage() {
	const { projectName = "" } = useParams()
	const automationsQuery = useQuery([QueryKey.GetAutomations, projectName], () =>
		getAutomations(projectName)
	)
	const templates = automationsQuery.data?.data.filter((automation) => automation.is_template)

	const helpDetails: HelpDetails = {
		title: "An automation template allows you to build automated workflows for your users",
		description:
			"You can add custom workflows to your application that are triggered by various events specific to each user by using automation templates.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/automations",
	}

	return (
		<AutomationList
			helpDetails={helpDetails}
			automations={templates}
			loading={automationsQuery.isLoading}
			title="Automation Templates"
			kind="template"
		/>
	)
}
