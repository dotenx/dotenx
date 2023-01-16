import { atom, useAtom } from "jotai"
import _ from "lodash"
import { useEffect, useState } from "react"
import ReactFlow from "reactflow"
import { AutomationKind } from "../../api"
import { EdgeSettings } from "../automation"
import { Modals, useModal } from "../hooks"
import { TaskLog, TaskLogProps, TaskSettingsWithIntegration } from "../task"
import { InputOrSelectKind, Modal } from "../ui"
import { EdgeData, EdgeEntity, PipeEdge } from "./edge"
import { TaskEntity, TaskNode, TaskNodeData } from "./task-node"
import { TriggerNode } from "./trigger-node"
import { useFlow } from "./use-flow"

const nodeTypes = {
	task: TaskNode,
	trigger: TriggerNode,
}

const edgeTypes = {
	default: PipeEdge,
}

export function Flow({ isEditable = true }: { isEditable?: boolean; kind: AutomationKind }) {
	const withIntegration = true
	const { reactFlowWrapper, elements, onDragOver, onDrop } = useFlow()

	return (
		<>
			<div ref={reactFlowWrapper} className="w-full h-full">
				<ReactFlow
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					onDragOver={isEditable ? onDragOver : undefined}
					onDrop={isEditable ? onDrop : undefined}
					nodesConnectable={isEditable}
				/>
			</div>
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

export const taskBuilderState = atom({ opened: false })

function TaskSettingsModal({ updateNode, withIntegration }: NodeSettingsModalProps) {
	const [isAddingIntegration, setIsAddingIntegration] = useState(false)
	const modal = useModal()
	const [taskCode, setTaskCode] = useAtom(taskCodeState)
	const [taskBuilder, setTaskBuilder] = useAtom(taskBuilderState)
	const modalSize =
		taskCode.isOpen || taskBuilder.opened ? "xl" : isAddingIntegration ? "lg" : "lg"

	useEffect(() => {
		if (!modal.isOpen) {
			setIsAddingIntegration(false)
			setTaskCode({ isOpen: false })
			setTaskBuilder({ opened: false })
		}
	}, [modal.isOpen, setTaskBuilder, setTaskCode])

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
									value ?? { type: InputOrSelectKind.Text, data: "" },
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
