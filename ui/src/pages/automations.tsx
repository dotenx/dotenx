import { useQuery } from "react-query"
import { Automation, getAutomations, QueryKey } from "../api"
import { AutomationList } from "../features/automation"
import { Content_Wrapper, Header } from "../features/ui"
import { AUTOMATION_PROJECT_NAME } from "./automation"

export default function AutomationsPage() {
	const automationsQuery = useQuery(QueryKey.GetAutomations, () =>
		getAutomations(AUTOMATION_PROJECT_NAME)
	)
	const automations = automationsQuery.data?.data.filter(isAutomation)

	return (
		<div className="w-full ">
			<Header title="Automations" headerLink="/" />
			<Content_Wrapper>
				<AutomationList
					automations={automations}
					loading={automationsQuery.isLoading}
					title=""
					kind="automation"
				/>
			</Content_Wrapper>
		</div>
	)
}

const isAutomation = (automation: Automation) =>
	!automation.is_template && !automation.is_interaction
