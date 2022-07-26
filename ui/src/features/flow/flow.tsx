import { atom, useAtom } from 'jotai'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import ReactFlow, { useZoomPanHelper } from 'react-flow-renderer'
import { AutomationKind } from '../../api'
import { EdgeSettings } from '../automation'
import { Modals, useModal } from '../hooks'
import { TaskLog, TaskLogProps, TaskSettingsWithIntegration } from '../task'
import { TriggerSettingsModal } from '../trigger/settings'
import { InputOrSelectKind, Modal } from '../ui'
import { EdgeData, EdgeEntity, PipeEdge } from './edge'
import { TaskEntity, TaskNode, TaskNodeData } from './task-node'
import { TriggerNode } from './trigger-node'
import { useFlow } from './use-flow'

const nodeTypes = {
	task: TaskNode,
	trigger: TriggerNode,
}

const edgeTypes = {
	default: PipeEdge,
}

export function Flow({ isEditable = true, kind }: { isEditable?: boolean; kind: AutomationKind }) {
	const withIntegration = kind !== 'interaction'
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

	const { fitView } = useZoomPanHelper()

	useEffect(() => {
		fitView()
	}, [fitView])

	return (
		<>
			<div ref={reactFlowWrapper} className="w-full h-full">
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					elements={elements}
					onConnect={isEditable ? onConnect : undefined}
					onElementsRemove={isEditable ? onElementsRemove : undefined}
					onLoad={onLoad}
					onDragOver={isEditable ? onDragOver : undefined}
					onDrop={isEditable ? onDrop : undefined}
					nodesConnectable={isEditable}
				/>
			</div>

			<TaskSettingsModal withIntegration={withIntegration} updateNode={updateElement} />
			<TriggerSettingsModal withIntegration={withIntegration} updateNode={updateElement} />
			<EdgeSettingsModal updateEdge={updateElement} />
			<TaskLogModal />
		</>
	)
}

function TaskLogModal() {
	const modal = useModal()
	const data = modal.data as TaskLogProps | undefined

	return (
		<Modal kind={Modals.TaskLog} title="Task log">
			<TaskLog executionId={data?.executionId} taskName={data?.taskName} />
		</Modal>
	)
}

interface NodeSettingsModalProps {
	updateNode: (id: string, data: TaskNodeData) => void
	withIntegration: boolean
}

export const taskCodeState = atom<{ isOpen: boolean; key?: string; label?: string }>({
	isOpen: false,
})

function TaskSettingsModal({ updateNode, withIntegration }: NodeSettingsModalProps) {
	const [isAddingIntegration, setIsAddingIntegration] = useState(false)
	const modal = useModal()
	const [taskCode, setTaskCode] = useAtom(taskCodeState)
	const modalSize = taskCode.isOpen ? 'xl' : isAddingIntegration ? 'lg' : 'md'

	useEffect(() => {
		if (!modal.isOpen) {
			setIsAddingIntegration(false)
			setTaskCode({ isOpen: false })
		}
	}, [modal.isOpen, setTaskCode])

	return (
		<Modal title="Task Settings" kind={Modals.NodeSettings} size={modalSize}>
			{({ id, data }: TaskEntity) => (
				<TaskSettingsWithIntegration
					defaultValues={data}
					onSave={(values) => {
						updateNode(id, {
							...values,
							others: _.fromPairs(
								_.toPairs(values.others).map(([key, value]) => [
									key,
									value ?? { type: InputOrSelectKind.Text, data: '' },
								])
							),
						})
						modal.close()
					}}
					isAddingIntegration={isAddingIntegration}
					setIsAddingIntegration={setIsAddingIntegration}
					withIntegration={withIntegration}
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
