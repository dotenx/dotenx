import { DragEvent } from 'react'
import { NodeType } from './use-flow'

export function DragDropNodes() {
	const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
		event.dataTransfer.setData('application/reactflow', nodeType)
		event.dataTransfer.effectAllowed = 'move'
	}

	return (
		<aside className="flex flex-col justify-center h-full gap-3 px-6 text-xs">
			<div className="-mt-1">You can drag these nodes to the pane</div>
			<div className="flex gap-2">
				<div
					className="flex flex-col items-center justify-center p-1 font-bold text-center border-2 border-black rounded cursor-grab grow"
					onDragStart={(event) => onDragStart(event, NodeType.Task)}
					draggable
				>
					Task
				</div>
				<div
					className="flex flex-col items-center justify-center p-1 font-bold text-center text-orange-600 border-2 border-orange-600 rounded cursor-grab grow"
					onDragStart={(event) => onDragStart(event, NodeType.Trigger)}
					draggable
				>
					Trigger
				</div>
			</div>
		</aside>
	)
}
