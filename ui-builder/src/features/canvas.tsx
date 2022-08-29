import { ReactNode, useContext, useEffect } from 'react'
import { DndContext, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Frame, { FrameContext, FrameContextConsumer } from 'react-frame-component'
import { useCanvasStore } from './canvas-store'
import { RenderComponents } from './component-renderer'
import { Droppable, DroppableMode } from './droppable'
import { useSelectionStore } from './selection-store'
import { useViewportStore } from './viewport-store'

export const ROOT_ID = 'root'

function FrameBindingContext({ children }: { children: ReactNode }) {
	return (
		<FrameContextConsumer>
			{({ window }) => (
				<DndProvider backend={HTML5Backend} context={window}>
					{children}
				</DndProvider>
			)}
		</FrameContextConsumer>
	)
}

const DndFrame = ({ children }: { children: ReactNode }) => {
	const { dragDropManager } = useContext(DndContext)
	const { window } = useContext(FrameContext)

	useEffect(() => {
		const backend = dragDropManager?.getBackend() as any
		backend.addEventListeners(window)
	})

	return <>{children}</>
}

export function Canvas() {
	const components = useCanvasStore((store) => store.components)
	const deselectComponent = useSelectionStore((store) => store.deselect)
	const viewport = useViewportStore((store) => store.device)
	const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '48rem' : '28rem'

	return (
		<div className="h-full bg-gray-50 p-px">
			<Frame
				className="h-full w-full"
				onClick={() => document.querySelector('iframe')?.contentWindow?.focus()}
			>
				<DndFrame>
					<style>{`body { margin: 0 }`}</style>
					<Droppable
						data={{ mode: DroppableMode.InsertIn, componentId: ROOT_ID }}
						id={ROOT_ID}
						onClick={deselectComponent}
						style={{
							minHeight: '100vh',
							margin: '0 auto',
							transition: 'all 150ms',
							backgroundColor: 'white',
							maxWidth,
						}}
					>
						<RenderComponents components={components} state={{}} />
					</Droppable>
				</DndFrame>
			</Frame>
		</div>
	)
}
