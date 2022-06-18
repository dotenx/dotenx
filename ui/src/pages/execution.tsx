import { format } from 'date-fns'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { ReactFlowProvider } from 'react-flow-renderer'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { getAutomation, getExecution, QueryKey } from '../api'
import { selectedAutomationAtom } from '../features/atoms'
import { Flow } from '../features/flow'
import { useTaskStatus } from '../features/task'
import { Loader } from '../features/ui'

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
			setSelected({
				name: automationName,
				endpoint: automation.endpoint,
				is_active: automation.is_active,
			})
	}, [automation, automationName, setSelected])

	if (automationQuery.isLoading)
		return (
			<div className="flex items-center justify-center grow">
				<Loader />
			</div>
		)
	if (!automationName || !executionId) return null

	return (
		<>
			<ExecutionDetails automationName={automationName} executionId={executionId} />
			<div className="grow">
				<Flow isEditable={false} />
			</div>
		</>
	)
}

function ExecutionDetails({
	automationName,
	executionId,
}: {
	automationName: string
	executionId: string
}) {
	const query = useQuery([QueryKey.GetExecution, executionId], () => getExecution(executionId))
	const execution = query.data?.data
	const loading = query.isLoading || !execution

	return (
		<div className="fixed z-10 flex flex-col items-center px-1 leading-loose rounded-lg right-12 top-10 backdrop-blur-sm bg-white/50 drop-shadow-sm">
			{loading && <Loader className="p-4" />}
			{!loading && (
				<>
					<Link className="text-lg font-bold" to={`/automations/${automationName}`}>
						{automationName}
					</Link>
					<div>
						<span className="text-sm">
							{format(new Date(execution?.StartedAt), 'yyyy/MM/dd')}
						</span>
						<span className="ml-3 text-xs">
							{format(new Date(execution?.StartedAt), 'HH:mm:ss')}
						</span>
					</div>
				</>
			)}
		</div>
	)
}
