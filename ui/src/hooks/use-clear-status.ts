import { useAtom } from 'jotai'
import { useCallback } from 'react'
import { isNode, Node } from 'react-flow-renderer'
import { TaskNodeData } from '../components/task-node'
import { flowAtom } from './use-flow'

export function useClearStatus() {
	const setElements = useAtom(flowAtom)[1]

	return useCallback(() => {
		setElements((elements) =>
			elements.map((element) => {
				if (isNode(element)) {
					const node = element as Node<TaskNodeData>
					if (!node.data) return node
					return { ...node, data: { ...node.data, status: undefined } }
				}
				return element
			})
		)
	}, [setElements])
}
