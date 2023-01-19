import { useState } from "react"
import { useQuery } from "react-query"
import { useParams } from "react-router-dom"
import { getAutomations, QueryKey } from "../api"
import { AutomationList } from "../features/automation"
import { Content_Wrapper, Header } from "../features/ui"
import { HelpDetails } from "../features/ui/help-popover"

export default function WorkflowsPage() {
	const { projectName = "" } = useParams()
	const [activeTab, setActiveTab] = useState<"Interactions" | "Automations">("Interactions")

	const automationsQuery = useQuery(QueryKey.GetAutomations, () => getAutomations(projectName))

	const templates = automationsQuery.data?.data.filter((automation) => automation.is_template)

	const interactions = automationsQuery.data?.data.filter(
		(automation) => automation.is_interaction
	)

	const helpDetails: HelpDetails = {
		title: "Use Interactions to add custom logic to your applications",
		description:
			"An interaction gives you a way to implement custom workflows exposed as API endpoint.",
		videoUrl: "https://www.youtube.com/embed/_5GRK17KUrg",
		tutorialUrl: "https://docs.dotenx.com/docs/builder_studio/interactions",
	}

	return (
		<div>
			<Header
				title={"Workflows"}
				tabs={["Interactions", "Automations"]}
				onTabChange={(v: typeof activeTab) => {
					setActiveTab(v)
				}}
				activeTab={activeTab}
			></Header>
			<Content_Wrapper>
				{activeTab === "Interactions" && (
					<AutomationList
						automations={interactions}
						loading={automationsQuery.isLoading}
						kind="interaction"
					/>
				)}
				{activeTab === "Automations" && (
					<AutomationList
						automations={templates}
						loading={automationsQuery.isLoading}
						kind="template"
					/>
				)}
			</Content_Wrapper>
		</div>
	)
}
