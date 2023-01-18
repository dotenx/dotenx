import dagre from "dagre"
import { Position } from "reactflow"
import { FlowEdge, FlowNode, useFlowStore } from "./flow-store"

export const NODE_WIDTH = 172
export const NODE_HEIGHT = 36

export function useLayout() {
	const nodes = useFlowStore((store) => store.nodes)
	const setNodes = useFlowStore((store) => store.setNodes)
	const edges = useFlowStore((store) => store.edges)

	const node = nodes[0]
	const nodeWidth: number = node.width ? node.width : NODE_WIDTH
	const nodeHeight: number = node.height ? node.height : NODE_HEIGHT

	const onLayout = (direction: string) => {
		const layedOutNodes = getLayedOutElements(nodes, edges, direction, nodeWidth, nodeHeight)
		setNodes(layedOutNodes)
	}

	return { onLayout }
}

export function getLayedOutElements(
	nodes: FlowNode[],
	edges: FlowEdge[],
	direction = "TB",
	nodeWidth: number,
	nodeHeight: number
) {
	const dagreGraph = new dagre.graphlib.Graph()
	dagreGraph.setDefaultEdgeLabel(() => ({}))
	const isHorizontal = direction === "LR"
	dagreGraph.setGraph({ rankdir: direction })

	nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }))
	edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target))
	dagre.layout(dagreGraph)

	const newNodes = nodes.map((el) => {
		const nodeWithPosition = dagreGraph.node(el.id)
		el.targetPosition = isHorizontal ? Position.Left : Position.Top
		el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom
		el.position = {
			x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
			y: nodeWithPosition.y - nodeHeight / 2,
		}
		return el
	})

	return newNodes
}
