import { nanoid } from "nanoid"
import {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Connection,
	Edge,
	EdgeChange,
	Node,
	NodeChange,
	OnConnect,
	OnEdgesChange,
	OnNodesChange,
} from "reactflow"
import { create } from "zustand"
import { EdgeData } from "./edge"
import { TaskNodeData } from "./task-node"
import { NodeType } from "./types"

type FlowState = {
	nodes: FlowNode[]
	edges: FlowEdge[]
	onNodesChange: OnNodesChange
	onEdgesChange: OnEdgesChange
	onConnect: OnConnect
	addNode: (node: FlowNode) => void
	updateNode: (id: string, data: TaskNodeData) => void
	updateEdge: (id: string, data: EdgeData) => void
	setNodes: (nodes: FlowNode[]) => void
	setEdges: (edges: FlowEdge[]) => void
	deleteNode: (id: string) => void
	clearAllStatus: () => void
	reset: () => void
}

export type FlowNode = Node<TaskNodeData>
export type FlowEdge = Edge<EdgeData>

const initialNodes: FlowNode[] = [
	{
		id: nanoid(),
		type: NodeType.Task,
		data: { name: "task" },
		position: { x: 0, y: 0 },
	},
]
const initialEdges: FlowEdge[] = []

export const useFlowStore = create<FlowState>((set, get) => ({
	nodes: initialNodes,
	edges: initialEdges,
	onNodesChange: (changes: NodeChange[]) => {
		set({
			nodes: applyNodeChanges(changes, get().nodes),
		})
	},
	onEdgesChange: (changes: EdgeChange[]) => {
		set({
			edges: applyEdgeChanges(changes, get().edges),
		})
	},
	onConnect: (connection: Connection) => {
		set({
			edges: addEdge(connection, get().edges),
		})
	},
	addNode: (node: FlowNode) => {
		set({
			nodes: [...get().nodes, node],
		})
	},
	updateNode: (id: string, data: TaskNodeData) => {
		set({
			nodes: get().nodes.map((node) => (node.id === id ? { ...node, data } : node)),
		})
	},
	updateEdge: (id: string, data: EdgeData) => {
		set({
			edges: get().edges.map((edge) => (edge.id === id ? { ...edge, data } : edge)),
		})
	},
	setNodes: (nodes) => {
		set({ nodes })
	},
	setEdges: (edges) => {
		set({ edges })
	},
	deleteNode: (id: string) => {
		set({
			nodes: get().nodes.filter((node) => node.id !== id),
			edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
		})
	},
	clearAllStatus: () => {
		set({
			nodes: get().nodes.map((node) => ({
				...node,
				data: { ...node.data, status: undefined },
			})),
		})
	},
	reset: () => {
		set({
			nodes: initialNodes,
			edges: initialEdges,
		})
	},
}))
