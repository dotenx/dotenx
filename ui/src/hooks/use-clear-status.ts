import { useAtom } from 'jotai'
import { isNode, Node } from 'react-flow-renderer'
import { NodeData } from '../components/pipe-node'
import { flowAtom } from '../hooks/use-flow'

export function useClearStatus() {
	const setElements = useAtom(flowAtom)[1]

	return () => {
		setElements((elements) =>
			elements.map((element) => {
				if (isNode(element)) {
					const node = element as Node<NodeData>
					if (!node.data) return node
					return { ...node, data: { ...node.data, status: undefined } }
				}
				return element
			})
		)
	}
}
