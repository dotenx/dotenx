import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomation, QueryKey } from '../api'
import { selectedAutomationAtom } from '../features/atoms'
import { Flow } from '../features/flow'
import { useTaskStatus } from '../features/task'

export default function ExecutionPage() {
	return (
		<ReactFlowProvider>
			<Content />
		</ReactFlowProvider>
	)
}

function Content() {
	const { name: automationName, id: executionId } = useParams()
	const setSelectedAutomation = useSetAtom(selectedAutomationAtom)
	const automationQuery = useQuery(
		[QueryKey.GetAutomation, automationName],
		() => {
			if (!automationName) return
			return getAutomation(automationName)
		},
		{ enabled: !!automationName, onSuccess: (data) => setSelectedAutomation(data?.data) }
	)
	const { setSelected } = useTaskStatus(executionId)
	const automation = automationQuery.data?.data

	useEffect(() => {
		if (automationName && automation)
			setSelected({ name: automationName, endpoint: automation.endpoint })
	}, [automation, automationName, setSelected])

	return (
		<div className="grow">
			<Flow isEditable={false} />
		</div>
	)
}
