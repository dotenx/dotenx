import { useHotkeys } from '@mantine/hooks'
import { Droppable, DroppableMode } from '../dnd/droppable'
import { useElementsStore } from '../elements/elements-store'
import { CanvasFrame, ROOT_ID } from '../frame/canvas'
import { FrameDnd } from '../frame/dnd'
import { useCanvasHotkeys } from '../hotkey/hotkeys'
import { ElementOverlay, RenderElements } from './renderer'

export function AdvancedCanvas() {
	const elements = useElementsStore((store) => store.elements)
	const hotkeys = useCanvasHotkeys()
	useHotkeys(hotkeys)

	return (
		<CanvasFrame>
			<FrameDnd>
				<Droppable
					data={{ mode: DroppableMode.InsertIn, elementId: ROOT_ID }}
					style={{ minHeight: 'calc(100vh - 6px)' }}
				>
					<RenderElements elements={elements} overlay={ElementOverlay} />
				</Droppable>
			</FrameDnd>
		</CanvasFrame>
	)
}
