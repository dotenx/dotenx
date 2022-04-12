import dagre from 'dagre'
import { useAtom } from 'jotai'
import { Elements, isNode, useStoreState } from 'react-flow-renderer'
import { flowAtom } from '../atoms'
import { NODE_HEIGHT, NODE_WIDTH } from './use-layout'

export function useIsAcyclic() {
	const [elements] = useAtom(flowAtom)
	const nodes = useStoreState((state) => state.nodes)
	const node = nodes[0]
	const nodeWidth: number = node ? node.__rf.width : NODE_WIDTH
	const nodeHeight: number = node ? node.__rf.height : NODE_HEIGHT

	return {
		check: (source: string | null, target: string | null) => {
			if (!source || !target) {
				console.error('Edge id can not be null')
				return false
			}
			return isAcyclic(elements, 'TB', nodeWidth, nodeHeight, source, target)
		},
	}
}

function isAcyclic(
	elements: Elements,
	direction = 'TB',
	nodeWidth: number,
	nodeHeight: number,
	source: string,
	target: string
) {
	const dagreGraph = new dagre.graphlib.Graph()

	dagreGraph.setDefaultEdgeLabel(() => ({}))
	dagreGraph.setGraph({ rankdir: direction })

	elements.forEach((el) => {
		if (isNode(el)) {
			dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight })
		} else {
			dagreGraph.setEdge(el.source, el.target)
		}
	})

	dagreGraph.setEdge(source, target)

	return dagre.graphlib.alg.isAcyclic(dagreGraph)
}
