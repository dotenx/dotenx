import dagre from "dagre"
import { useAtom } from "jotai"
import { isNode, Position } from "reactflow"
import { flowAtom } from "../atoms"

export const NODE_WIDTH = 172
export const NODE_HEIGHT = 36

export function useLayout() {
	const [elements, setElements] = useAtom(flowAtom)
	const nodes: any[] = []
	const node = nodes[0]
	const nodeWidth: number = node ? node.__rf.width : NODE_WIDTH
	const nodeHeight: number = node ? node.__rf.height : NODE_HEIGHT

	const onLayout = (direction: string) => {
		const layedElements = getLaidOutElements(elements, direction, nodeWidth, nodeHeight)
		setElements(layedElements)
	}

	return { onLayout }
}

export function getLaidOutElements(
	elements: any[],
	direction = "TB",
	nodeWidth: number,
	nodeHeight: number
) {
	const dagreGraph = new dagre.graphlib.Graph()

	dagreGraph.setDefaultEdgeLabel(() => ({}))
	const isHorizontal = direction === "LR"
	dagreGraph.setGraph({ rankdir: direction })

	elements.forEach((el) => {
		if (isNode(el)) {
			dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight })
		} else {
			dagreGraph.setEdge(el.source, el.target)
		}
	})

	dagre.layout(dagreGraph)

	return elements.map((el) => {
		if (isNode(el)) {
			const nodeWithPosition = dagreGraph.node(el.id)
			el.targetPosition = isHorizontal ? Position.Left : Position.Top
			el.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

			el.position = {
				x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
				y: nodeWithPosition.y - nodeHeight / 2,
			}
		}

		return el
	})
}
