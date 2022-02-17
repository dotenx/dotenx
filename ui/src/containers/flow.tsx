import { useTheme } from '@emotion/react'
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer'
import { Modal } from '../components/modal'
import { EdgeData, EdgeEntity, PipeEdge } from '../components/pipe-edge'
import { NodeData, NodeEntity, PipeNode } from '../components/pipe-node'
import { getNodeColor, useFlow } from '../hooks/use-flow'
import { Modals, useModal } from '../hooks/use-modal'
import { EdgeSettings } from './edge-settings'
import { NodeSettings } from './node-settings'
import { TaskLog, TaskLogProps } from './task-log'

const nodeTypes = {
	default: PipeNode,
}

const edgeTypes = {
	default: PipeEdge,
}

export function Flow() {
	const {
		reactFlowWrapper,
		elements,
		onConnect,
		onDragOver,
		onDrop,
		onElementsRemove,
		onLoad,
		updateElement,
	} = useFlow()
	const theme = useTheme()

	return (
		<>
			<div ref={reactFlowWrapper} css={{ width: '100%', height: '100%' }}>
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					elements={elements}
					onConnect={onConnect}
					onElementsRemove={onElementsRemove}
					onLoad={onLoad}
					onDragOver={onDragOver}
					onDrop={onDrop}
					snapToGrid
				>
					<Background />
					<MiniMap nodeColor={(node) => getNodeColor(theme, node)} />
					<Controls />
				</ReactFlow>
			</div>

			<NodeSettingsModal updateNode={updateElement} />
			<EdgeSettingsModal updateEdge={updateElement} />
			<TaskLogModal />
		</>
	)
}

function TaskLogModal() {
	const modal = useModal()
	const data = modal.data as TaskLogProps | undefined

	return (
		<Modal kind={Modals.TaskLog}>
			<TaskLog executionId={data?.executionId} taskName={data?.taskName} />
		</Modal>
	)
}

interface NodeSettingsModalProps {
	updateNode: (id: string, data: NodeData) => void
}

function NodeSettingsModal({ updateNode }: NodeSettingsModalProps) {
	const modal = useModal()

	return (
		<Modal kind={Modals.NodeSettings}>
			{({ id, data }: NodeEntity) => (
				<NodeSettings
					defaultValues={data}
					onSave={(values) => {
						updateNode(id, values)
						modal.close()
					}}
				/>
			)}
		</Modal>
	)
}

interface EdgeSettingsModalProps {
	updateEdge: (id: string, data: EdgeData) => void
}

function EdgeSettingsModal({ updateEdge }: EdgeSettingsModalProps) {
	const modal = useModal()

	return (
		<Modal kind={Modals.EdgeSettings}>
			{({ id, data }: EdgeEntity) => (
				<EdgeSettings
					defaultValues={data}
					onSave={(values) => {
						updateEdge(id, values)
						modal.close()
					}}
				/>
			)}
		</Modal>
	)
}
