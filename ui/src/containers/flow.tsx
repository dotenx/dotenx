/** @jsxImportSource @emotion/react */
import { useTheme } from '@emotion/react'
import { useAtom } from 'jotai'
import ReactFlow, { Background, Controls, MiniMap } from 'react-flow-renderer'
import { EdgeData, EdgeEntity, PipeEdge } from '../components/edge'
import { Modal } from '../components/modal'
import { TaskEntity, TaskNode, TaskNodeData } from '../components/task-node'
import { TriggerEntity, TriggerNode } from '../components/trigger-node'
import { getNodeColor, useFlow } from '../hooks/use-flow'
import { Modals, useModal } from '../hooks/use-modal'
import { selectedPipelineDataAtom } from '../pages/home'
import { EdgeSettings } from './edge-settings'
import { TaskLog, TaskLogProps } from './task-log'
import { TaskSettings } from './task-settings'
import { TriggerSettings } from './trigger-settings'

const nodeTypes = {
	default: TaskNode,
	trigger: TriggerNode,
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
			<TriggerSettingsModal updateNode={updateElement} />
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
	updateNode: (id: string, data: TaskNodeData) => void
}

function NodeSettingsModal({ updateNode }: NodeSettingsModalProps) {
	const modal = useModal()

	return (
		<Modal kind={Modals.NodeSettings}>
			{({ id, data }: TaskEntity) => (
				<TaskSettings
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

function TriggerSettingsModal({ updateNode }: NodeSettingsModalProps) {
	const modal = useModal()
	const [pipeline] = useAtom(selectedPipelineDataAtom)

	return (
		<Modal kind={Modals.TriggerSettings}>
			{({ id, data }: TriggerEntity) => (
				<TriggerSettings
					defaultValues={{ ...data, pipeline_name: pipeline?.name ?? 'default' }}
					onSave={(values) => {
						updateNode(id, values)
						modal.close()
					}}
				/>
			)}
		</Modal>
	)
}
