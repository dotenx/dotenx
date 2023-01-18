import { useSetAtom } from "jotai"
import { useQuery } from "react-query"
import { ReactFlowProvider } from "reactflow"
import { AutomationKind, getAutomation, QueryKey } from "../../api"
import { selectedAutomationAtom, selectedAutomationDataAtom } from "../atoms"
import { Flow } from "../flow"
import { Loader } from "../ui"
import { ActionBar } from "./action-bar"

interface AutomationProps {
	name?: string
	kind: AutomationKind
	projectName: string
}

export function Automation({ name, kind, projectName }: AutomationProps) {
	return (
		<ReactFlowProvider>
			<Content name={name} kind={kind} projectName={projectName} />
		</ReactFlowProvider>
	)
}

function Content({ name, kind, projectName }: AutomationProps) {
	const setSelectedAutomation = useSetAtom(selectedAutomationAtom)
	const setSelected = useSetAtom(selectedAutomationDataAtom)
	const { isLoading } = useQuery(
		[QueryKey.GetAutomation, name, projectName],
		() => {
			if (!name) return
			return getAutomation({ name, projectName })
		},
		{
			enabled: !!name,
			onSuccess: (data) => {
				if (!name || !data) return
				setSelectedAutomation(data.data)
				setSelected({ name, endpoint: data?.data.endpoint, is_active: data.data.is_active })
			},
		}
	)

	if (isLoading)
		return (
			<div className="flex justify-center grow">
				<Loader />
			</div>
		)

	return (
		<>
			<ActionBar projectName={projectName} automationName={name} kind={kind} />
			<div className="flex gap-2 grow">
				<Flow kind={kind} />
			</div>
		</>
	)
}
