import clsx from 'clsx'
import Color from 'color'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Handle, NodeProps, Position } from 'react-flow-renderer'
import { BsGearFill, BsReceipt as LogIcon } from 'react-icons/bs'
import { TaskExecutionStatus } from '../../api'
import { BuilderSteps } from '../../internal/task-builder'
import { Modals, useModal } from '../hooks'
import { ComplexFieldValue } from '../ui/complex-field'
import { ContextMenu } from './context-menu'
import { useDeleteNode } from './use-delete-node'
import { useIsAcyclic } from './use-is-acyclic'

export interface TaskNodeData {
	name: string
	type: string
	integration?: string
	status?: TaskExecutionStatus
	executionId?: string
	iconUrl?: string
	color?: string
	others?: TaskOthers
	vars?: { key: string; value: ComplexFieldValue }[]
	outputs?: { value: string }[]
}

export type TaskOthers = Record<string, ComplexFieldValue | BuilderSteps>

export interface TaskEntity {
	id: string
	data: TaskNodeData
}

export function TaskNode({ id, data, isConnectable }: NodeProps<TaskNodeData>) {
	const modal = useModal()
	const nodeEntity: TaskEntity = { id, data }
	const isAcyclic = useIsAcyclic()
	const color = nodeEntity.data.color || '#059669'
	const lightColor = Color(color).lightness(90).string()
	const [menuIsOpen, setMenuIsOpen] = useState(false)
	const deleteNode = useDeleteNode()

	const wrapperStyle = {
		backgroundColor: color,
		'--tw-ring-color': lightColor,
	}

	const settingsButtonStyle = {
		color: color,
		backgroundColor: lightColor,
		outlineColor: Color(color).lighten(0.1).string(),
	}

	return (
		<div
			className="relative group"
			onContextMenu={(e) => {
				e.preventDefault()
				setMenuIsOpen((menuIsOpen) => !menuIsOpen)
			}}
		>
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ type: 'spring', bounce: 0.5 }}
			>
				<div
					className="flex gap-0.5 group items-center relative justify-between text-[10px] text-white rounded px-3 py-1.5 transition-all group-hover:ring-4  focus:ring-4 outline-none"
					style={wrapperStyle}
					tabIndex={0}
				>
					<div className="text-left">
						<div className="flex flex-col items-center gap-2">
							<img
								className="w-4 h-4 p-px bg-white rounded-sm"
								src={data.iconUrl}
								alt=""
								draggable={false}
							/>
							<div className="w-20 overflow-hidden text-center text-ellipsis whitespace-nowrap">
								{data.name}
							</div>
						</div>
						{data.status && (
							<div className="flex gap-1 text-[8px] items-center justify-between mt-1">
								<p
									className={clsx(
										'rounded py-px px-1',
										getStatusColor(data.status)
									)}
								>
									{data.status}
								</p>
								<button
									className="p-1 rounded bg-black/10"
									onClick={() =>
										modal.open(Modals.TaskLog, {
											executionId: data.executionId,
											taskName: data.name,
										})
									}
								>
									<LogIcon />
								</button>
							</div>
						)}
					</div>
					{isConnectable && (
						<button
							className="hover:animate-spin absolute p-0.5 text-[11px] transition rounded-full opacity-0 -right-2 group-hover:opacity-100 focus:opacity-100"
							style={settingsButtonStyle}
							onClick={() => modal.open(Modals.NodeSettings, nodeEntity)}
						>
							<BsGearFill />
						</button>
					)}
				</div>
			</motion.div>
			{isConnectable && (
				<>
					<Handle
						className="transition opacity-0 group-hover:opacity-100"
						type="target"
						position={Position.Top}
					/>
					<Handle
						className="transition opacity-0 group-hover:opacity-100"
						type="source"
						position={Position.Bottom}
						isValidConnection={({ source, target }) => isAcyclic.check(source, target)}
					/>
					<ContextMenu
						onClose={() => setMenuIsOpen(false)}
						onDelete={() => deleteNode(id)}
						isOpen={menuIsOpen}
					/>
				</>
			)}
		</div>
	)
}

function getStatusColor(status?: TaskExecutionStatus) {
	switch (status) {
		case TaskExecutionStatus.Cancelled:
			return 'bg-gray-700'
		case TaskExecutionStatus.Completed:
			return 'bg-green-700'
		case TaskExecutionStatus.Failed:
			return 'bg-red-700'
		case TaskExecutionStatus.Started:
			return 'bg-blue-700'
		case TaskExecutionStatus.Success:
			return 'bg-green-700'
		case TaskExecutionStatus.Timedout:
			return 'bg-red-700'
		case TaskExecutionStatus.Waiting:
			return 'bg-gray-700'
		default:
			return 'bg-gray-700'
	}
}
