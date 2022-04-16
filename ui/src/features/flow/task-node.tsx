import clsx from 'clsx'
import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { BsGearFill, BsReceipt as LogIcon } from 'react-icons/bs'
import { TaskExecutionStatus } from '../../api'
import { Modals, useModal } from '../hooks'
import { Button } from '../ui'
import { useIsAcyclic } from './use-is-acyclic'

export interface TaskNodeData {
	name: string
	type: string
	status?: TaskExecutionStatus
	executionId?: string
	integration?: string
	iconUrl?: string
}

export interface TaskEntity {
	id: string
	data: TaskNodeData
}

export enum NodeType {
	Default = 'default',
	Trigger = 'trigger',
}

export function TaskNode({ id, data }: NodeProps<TaskNodeData>) {
	const modal = useModal()
	const nodeEntity: TaskEntity = { id, data }
	const isAcyclic = useIsAcyclic()

	return (
		<div
			className={clsx(
				'flex gap-0.5 items-center justify-between rounded py-0.5 px-1',
				getStatusColor(data.status)
			)}
		>
			<Handle type="target" position={Position.Top} />

			<div className="text-left">
				<div className="flex gap-1.5 items-center">
					{data.iconUrl && <img className="w-4 h-4" src={data.iconUrl} alt="" />}
					<span>{data.name}</span>
				</div>
				{data.status && (
					<div className="flex gap-1 text-[8px] items-center">
						<p>{data.status}</p>
						<Button
							onClick={() =>
								modal.open(Modals.TaskLog, {
									executionId: data.executionId,
									taskName: data.name,
								})
							}
						>
							<LogIcon />
						</Button>
					</div>
				)}
			</div>
			<Button
				className="shrink-0"
				onClick={() => modal.open(Modals.NodeSettings, nodeEntity)}
			>
				<BsGearFill />
			</Button>

			<Handle
				type="source"
				position={Position.Bottom}
				isValidConnection={({ source, target }) => isAcyclic.check(source, target)}
			/>
		</div>
	)
}

function getStatusColor(status?: TaskExecutionStatus) {
	switch (status) {
		case TaskExecutionStatus.Cancelled:
			return 'bg-white'
		case TaskExecutionStatus.Completed:
			return 'bg-green-400'
		case TaskExecutionStatus.Failed:
			return 'bg-red-400'
		case TaskExecutionStatus.Started:
			return 'bg-blue-400'
		case TaskExecutionStatus.Success:
			return 'bg-green-400'
		case TaskExecutionStatus.Timedout:
			return 'bg-red-400'
		case TaskExecutionStatus.Waiting:
			return 'bg-white'
		default:
			return 'bg-white'
	}
}
