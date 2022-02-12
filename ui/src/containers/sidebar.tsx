import { DragEvent } from 'react'

export function Sidebar() {
	const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType)
		event.dataTransfer.effectAllowed = 'move'
	}

	return (
		<aside css={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
			<div>You can drag these nodes to the pane</div>
			<div
				css={(theme) => ({
					border: '1px solid',
					textAlign: 'center',
					padding: 6,
					borderRadius: 4,
					borderColor: theme.color.text,
					cursor: 'grab',
				})}
				onDragStart={(event) => onDragStart(event, 'default')}
				draggable
			>
				Pipe Node
			</div>
		</aside>
	)
}
