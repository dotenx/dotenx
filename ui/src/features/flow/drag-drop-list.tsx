/** @jsxImportSource @emotion/react */
import { DragEvent } from 'react'
import { NodeType } from './task-node'

export function DragDropNodes() {
	const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType)
		event.dataTransfer.effectAllowed = 'move'
	}

	return (
		<aside css={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
			<div className="-mt-1">You can drag these nodes to the pane</div>
			<div css={{ display: 'flex', gap: 6 }}>
				<div
					css={(theme) => ({
						border: '2px solid',
						textAlign: 'center',
						borderRadius: 4,
						borderColor: theme.color.text,
						cursor: 'grab',
						flexGrow: 1,
					})}
					className="flex flex-col items-center justify-center p-1 font-bold"
					onDragStart={(event) => onDragStart(event, NodeType.Default)}
					draggable
				>
					Task
				</div>
				<div
					css={(theme) => ({
						border: '2px solid',
						textAlign: 'center',
						borderRadius: 4,
						borderColor: theme.color.primary,
						cursor: 'grab',
						flexGrow: 1,
						color: theme.color.primary,
					})}
					className="flex flex-col items-center justify-center p-1 font-bold"
					onDragStart={(event) => onDragStart(event, NodeType.Trigger)}
					draggable
				>
					Trigger
				</div>
			</div>
		</aside>
	)
}
