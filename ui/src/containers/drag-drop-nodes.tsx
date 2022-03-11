import { DragEvent } from 'react'
import { NodeType } from '../components/task-node'

export function DragDropNodes() {
	const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType)
		event.dataTransfer.effectAllowed = 'move'
	}

	return (
		<aside css={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
			<div>You can drag these nodes to the pane</div>
			<div css={{ display: 'flex', gap: 6 }}>
				<div
					css={(theme) => ({
						border: '1px solid',
						textAlign: 'center',
						padding: 6,
						borderRadius: 4,
						borderColor: theme.color.text,
						cursor: 'grab',
						flexGrow: 1,
					})}
					onDragStart={(event) => onDragStart(event, NodeType.Default)}
					draggable
				>
					Task
				</div>
				<div
					css={(theme) => ({
						border: '1px solid',
						textAlign: 'center',
						padding: 6,
						borderRadius: 4,
						borderColor: theme.color.primary,
						cursor: 'grab',
						flexGrow: 1,
						color: theme.color.primary,
					})}
					onDragStart={(event) => onDragStart(event, NodeType.Trigger)}
					draggable
				>
					Trigger
				</div>
			</div>
		</aside>
	)
}
