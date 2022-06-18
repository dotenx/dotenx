import { useSetAtom } from 'jotai'
import { ReactFlowProvider } from 'react-flow-renderer'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomation, QueryKey } from '../api'
import { selectedAutomationAtom, selectedAutomationDataAtom } from '../features/atoms'
import { ActionBar } from '../features/automation'
import { Flow } from '../features/flow'
import { Loader } from '../features/ui'

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
	const { isLoading } = useQuery(
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
			<ActionBar automationName={name} />
			<div className="flex gap-2 grow">
				<Flow />
			</div>
		</>
	)
}
