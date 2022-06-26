import { useSetAtom } from 'jotai'
import { ReactFlowProvider } from 'react-flow-renderer'
import { useQuery } from 'react-query'
import { AutomationKind, getAutomation, QueryKey } from '../../api'
import { selectedAutomationAtom, selectedAutomationDataAtom } from '../atoms'
import { Flow } from '../flow'
import { Loader } from '../ui'
import { ActionBar } from './action-bar'

interface AutomationProps {
	name?: string
	kind: AutomationKind
}

export function Automation({ name, kind }: AutomationProps) {
	return (
		<ReactFlowProvider>
			<Content name={name} kind={kind} />
		</ReactFlowProvider>
	)
}

function Content({ name, kind }: AutomationProps) {
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
				<Flow kind={kind} />
			</div>
		</>
	)
}
