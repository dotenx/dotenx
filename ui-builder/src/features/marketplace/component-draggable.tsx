import { Tb3DCubeSphere } from 'react-icons/tb'
import { Component } from '../../api'
import { Draggable, DraggableMode } from '../dnd/draggable'

export function ComponentDraggable({ components }: { components: Component[] }) {
	return (
		<div className="grid grid-cols-3 gap-2">
			{components.map((component) => (
				<Draggable
					key={component.name}
					data={{ mode: DraggableMode.AddWithData, data: component.content }}
				>
					<div className="flex flex-col items-center gap-2 p-2 rounded bg-gray-50 cursor-grab text-slate-600 hover:text-slate-900">
						<div className="pt-1 text-2xl">
							<Tb3DCubeSphere />
						</div>
						<p className="text-xs text-center">{component.name}</p>
					</div>
				</Draggable>
			))}
		</div>
	)
}
