import { clsx } from '@mantine/core'
import { useCanvasStore } from './canvas-store'
import { renderComponents } from './component-renderer'
import { Droppable, DroppableMode } from './droppable'
import { useSelectionStore } from './selection-store'
import { useViewportStore } from './viewport-store'

export const ROOT_ID = 'root'

export function Canvas() {
	const components = useCanvasStore((store) => store.components)
	const deselectComponent = useSelectionStore((store) => store.deselect)
	const viewport = useViewportStore((store) => store.device)

	return (
		<Droppable
			data={{ mode: DroppableMode.InsertIn, componentId: ROOT_ID }}
			className={clsx(
				'h-full p-px mx-auto transition-all',
				viewport === 'desktop' && 'max-w-full',
				viewport === 'tablet' && 'max-w-3xl',
				viewport === 'mobile' && 'max-w-md'
			)}
			id={ROOT_ID}
			onClick={deselectComponent}
		>
			{renderComponents(components)}
		</Droppable>
	)
}
