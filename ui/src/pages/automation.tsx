import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import { Automation, getAutomation, QueryKey } from '../api'
import { selectedAutomationAtom } from '../features/atoms'
import { ActionBar, AutomationExecution } from '../features/automation'
import { DragDropNodes, Flow } from '../features/flow'
import { useTaskStatus } from '../features/task'

export default function AutomationPage() {
	const { name } = useParams()
	const setSelectedAutomation = useAtom(selectedAutomationAtom)[1]
	const automationQuery = useQuery(
		[QueryKey.GetAutomation, name],
		() => {
			if (!name) return
			return getAutomation(name)
		},
		{ enabled: !!name, onSuccess: (data) => setSelectedAutomation(data?.data) }
	)
	const { executionId, selected, setExecutionId, setSelected } = useTaskStatus()
	const automation = automationQuery.data?.data

	useEffect(() => {
		if (name && automation) setSelected({ name, endpoint: automation.endpoint })
	}, [automation, name, setSelected])

	return (
		<div className="flex gap-2 grow">
			<div className="grow">
				<Flow />
			</div>
		</div>
	)
}

interface HeaderProps {
	selected: Automation | undefined
	executionId: number | undefined
	setExecutionId: (value: number | undefined) => void
}

function Header({ executionId, selected, setExecutionId }: HeaderProps) {
	return (
		<div className="flex h-full">
			<div className="flex items-center justify-between px-6 border-r border-black grow">
				<div className="flex gap-2">
					{selected && (
						<AutomationExecution
							automationName={selected?.name}
							value={executionId}
							onChange={setExecutionId}
						/>
					)}
				</div>

				<ActionBar />
			</div>
			<div>
				<DragDropNodes />
			</div>
		</div>
	)
}
