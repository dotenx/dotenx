/** @jsxImportSource @emotion/react */
import { Theme } from '@emotion/react'
import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { BsGearFill, BsReceipt as LogIcon } from 'react-icons/bs'
import { TaskExecutionStatus } from '../../api'
import { useIsAcyclic } from '../hooks/use-is-acyclic'
import { Modals, useModal } from '../hooks/use-modal'
import { Button } from '../ui'

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
			css={(theme) => ({
				display: 'flex',
				gap: 2,
				alignItems: 'center',
				justifyContent: 'space-between',
				backgroundColor: getStatusColor(theme, data.status),
				borderRadius: 4,
				padding: '2px 4px',
			})}
		>
			<Handle type="target" position={Position.Top} />

			<div css={{ textAlign: 'start' }}>
				<div css={{ display: 'flex', gap: 6, alignItems: 'center' }}>
					{data.iconUrl && (
						<img src={data.iconUrl} alt="" css={{ width: 16, height: 16 }} />
					)}
					<span>{data.name}</span>
				</div>
				{data.status && (
					<div
						css={{
							display: 'flex',
							gap: 4,
							fontSize: 8,
							alignItems: 'center',
						}}
					>
						<p>{data.status}</p>
						<Button
							variant="icon"
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
				variant="icon"
				css={{ flexShrink: 0 }}
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

function getStatusColor(theme: Theme, status?: TaskExecutionStatus) {
	switch (status) {
		case TaskExecutionStatus.Cancelled:
			return theme.color.background
		case TaskExecutionStatus.Completed:
			return theme.color.positive
		case TaskExecutionStatus.Failed:
			return theme.color.negative
		case TaskExecutionStatus.Started:
			return '#8EA6BB'
		case TaskExecutionStatus.Success:
			return theme.color.positive
		case TaskExecutionStatus.Timedout:
			return theme.color.negative
		case TaskExecutionStatus.Waiting:
			return theme.color.background
		default:
			return theme.color.background
	}
}
