import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Node } from 'react-flow-renderer'
import { API_URL, AutomationEventMessage } from '../../api'
import { flowAtom, listenAtom, selectedAutomationDataAtom, selectedExecutionAtom } from '../atoms'
import { TaskNodeData, useClearStatus } from '../flow'

export function useTaskStatus() {
	const [selected, setSelected] = useAtom(selectedAutomationDataAtom)
	const [executionId, setExecutionId] = useAtom(selectedExecutionAtom)
	const setElements = useAtom(flowAtom)[1]
	const clearStatus = useClearStatus()
	const [listen] = useAtom(listenAtom)

	const handleReceiveMessage = useCallback(
		(event: MessageEvent<string>) => {
			const data: AutomationEventMessage = JSON.parse(event.data)

			setElements((elements) =>
				elements.map((element) => {
					const updated = data.tasks.find((task) => task.name === element.id)
					if (!updated) return element
					const node = element as Node<TaskNodeData>
					if (!node.data) return node
					return {
						...node,
						data: {
							...node.data,
							status: updated.status,
							name: updated.name,
							executionId: data.execution_id,
						},
					}
				})
			)
		},
		[setElements]
	)

	useEffect(() => {
		if (executionId) return
		if (!selected) return
		const eventSource = new EventSource(`${API_URL}/execution/name/${selected.name}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		eventSource.addEventListener('end', () => eventSource.close())
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [executionId, handleReceiveMessage, selected, listen])

	useEffect(() => {
		if (!executionId) return
		clearStatus()
		const eventSource = new EventSource(`${API_URL}/execution/id/${executionId}/status`)
		eventSource.addEventListener('message', handleReceiveMessage)
		eventSource.addEventListener('end', () => eventSource.close())
		return () => {
			eventSource.removeEventListener('message', handleReceiveMessage)
			eventSource.close()
		}
	}, [clearStatus, executionId, handleReceiveMessage])

	return {
		selected,
		executionId,
		setSelected,
		setExecutionId,
	}
}
