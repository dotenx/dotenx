import { useAtom } from 'jotai'
import ReactFlow from 'react-flow-renderer'
import { CreateTriggerRequest } from '../../api'
import { selectedAutomationDataAtom } from '../atoms'
import { EdgeSettings } from '../automation'
import { Modals, useModal } from '../hooks'
import { TaskLog, TaskLogProps, TaskSettings } from '../task'
import { TriggerForm } from '../trigger'
import { Modal } from '../ui'
import { EdgeData, EdgeEntity, PipeEdge } from './edge'
import { TaskEntity, TaskNode, TaskNodeData } from './task-node'
import { TriggerEntity, TriggerNode } from './trigger-node'
import { useFlow } from './use-flow'

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

	return (
		<>
			<div ref={reactFlowWrapper} className="w-full h-full">
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					elements={elements}
					onConnect={onConnect}
					onElementsRemove={onElementsRemove}
					onLoad={onLoad}
					onDragOver={onDragOver}
					onDrop={onDrop}
				/>
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
		<Modal title="Task Settings" kind={Modals.NodeSettings}>
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
		<Modal title="Edge Settings" kind={Modals.EdgeSettings}>
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
	const [automation] = useAtom(selectedAutomationDataAtom)

	return (
		<Modal title="Trigger Settings" kind={Modals.TriggerSettings}>
			{({ id, data }: TriggerEntity) => (
				<TriggerSettings
					defaultValues={{ ...data, pipeline_name: automation?.name ?? 'default' }}
					onSave={(values) => {
						updateNode(id, values)
						modal.close()
					}}
				/>
			)}
		</Modal>
	)
}

interface TriggerSettingsProps {
	defaultValues: CreateTriggerRequest
	onSave: (values: CreateTriggerRequest) => void
}

export function TriggerSettings({ defaultValues, onSave }: TriggerSettingsProps) {
	return (
		<div className="h-full">
			<TriggerForm defaultValues={defaultValues} onSave={onSave} mode="settings" />
		</div>
	)
}
