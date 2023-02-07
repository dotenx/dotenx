import { useAtom, useAtomValue } from "jotai"
import { useCallback, useEffect } from "react"
import { API_URL, AutomationEventMessage } from "../../api"
import { listenAtom, selectedAutomationDataAtom } from "../atoms"
import { FlowNode, useFlowStore } from "../flow/flow-store"

export function useTaskStatus(executionId?: string) {
	const [selected, setSelected] = useAtom(selectedAutomationDataAtom)
	const nodes = useFlowStore((store) => store.nodes)
	const setNodes = useFlowStore((store) => store.setNodes)
	const clearStatus = useFlowStore((store) => store.clearAllStatus)
	const listen = useAtomValue(listenAtom)

	const handleReceiveMessage = useCallback(
		(event: MessageEvent<string>) => {
			const data: AutomationEventMessage = JSON.parse(event.data)

			setNodes(
				nodes.map((element) => {
					const updated = data.tasks.find((task) => task.name === element.id)
					if (!updated) return element
					const node = element as FlowNode
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
		[nodes, setNodes]
	)

	useEffect(() => {
		if (executionId) return
		if (!selected) return
		const eventSource = new EventSource(`${API_URL}/execution/name/${selected.name}/status`, {
			withCredentials: true,
		})
		eventSource.addEventListener("message", handleReceiveMessage)
		eventSource.addEventListener("end", () => eventSource.close())
		return () => {
			eventSource.removeEventListener("message", handleReceiveMessage)
			eventSource.close()
		}
	}, [executionId, handleReceiveMessage, selected, listen])

	useEffect(() => {
		if (!executionId) return
		// clearStatus()
		const eventSource = new EventSource(`${API_URL}/execution/id/${executionId}/status`, {
			withCredentials: true,
		})
		eventSource.addEventListener("message", handleReceiveMessage)
		eventSource.addEventListener("end", () => eventSource.close())
		return () => {
			eventSource.removeEventListener("message", handleReceiveMessage)
			eventSource.close()
		}
	}, [clearStatus, executionId, handleReceiveMessage])

	return {
		setSelected,
	}
}
