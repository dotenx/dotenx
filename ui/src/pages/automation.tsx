import { useSetAtom } from 'jotai'
import { ReactFlowProvider } from 'react-flow-renderer'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomation, QueryKey } from '../api'
import { selectedAutomationAtom, selectedAutomationDataAtom } from '../features/atoms'
import { ActionBar } from '../features/automation'
import { Flow } from '../features/flow'
import { Modals } from '../features/hooks'
import { NewIntegration } from '../features/integration'
import { Modal } from '../features/ui'

export default function AutomationPage() {
	return (
		<ReactFlowProvider>
			<Content />
		</ReactFlowProvider>
	)
}

function Content() {
	const { name } = useParams()
	const setSelectedAutomation = useSetAtom(selectedAutomationAtom)
	const setSelected = useSetAtom(selectedAutomationDataAtom)
	useQuery(
		[QueryKey.GetAutomation, name],
		() => {
			if (!name) return
			return getAutomation(name)
		},
		{
			enabled: !!name,
			onSuccess: (data) => {
				if (!name || !data) return
				setSelectedAutomation(data.data)
				setSelected({ name, endpoint: data?.data.endpoint })
			},
		}
	)

	return (
		<>
			<ActionBar automationName={name} />
			<div className="flex gap-2 grow">
				<div className="grow">
					<Flow />
				</div>
			</div>
			<Modal kind={Modals.NewIntegration} title="New Integration" size="lg">
				<NewIntegration />
			</Modal>
		</>
	)
}
