import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { getAutomation, QueryKey } from '../api'
import { selectedAutomationAtom } from '../features/atoms'
import { ActionBar } from '../features/automation'
import { Flow } from '../features/flow'
import { useTaskStatus } from '../features/task'

export default function AutomationPage() {
	const { name, id: executionId } = useParams()
	const setSelectedAutomation = useAtom(selectedAutomationAtom)[1]
	const automationQuery = useQuery(
		[QueryKey.GetAutomation, name],
		() => {
			if (!name) return
			return getAutomation(name)
		},
		{ enabled: !!name, onSuccess: (data) => setSelectedAutomation(data?.data) }
	)
	const { setSelected } = useTaskStatus(executionId)
	const automation = automationQuery.data?.data

	useEffect(() => {
		if (name && automation) setSelected({ name, endpoint: automation.endpoint })
	}, [automation, name, setSelected])

	return (
		<>
			<ActionBar automationName={name} />
			<div className="flex gap-2 grow">
				<div className="grow">
					<Flow />
				</div>
			</div>
		</>
	)
}
