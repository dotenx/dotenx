import { ReactNode, useContext, useEffect } from 'react'
import { DndContext } from 'react-dnd'
import Frame, { FrameContext } from 'react-frame-component'
import { useCanvasStore } from './canvas-store'
import { RenderComponents } from './component-renderer'
import { Droppable, DroppableMode } from './droppable'
import { useSelectionStore } from './selection-store'
import { useViewportStore } from './viewport-store'

export const ROOT_ID = 'root'

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
			<Frame className="h-full w-full">
				<DndFrame>
					<style>{`body { margin: 0; font-family: sans-serif; }`}</style>
					<div
						style={{
							height: '100vh',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'start',
						}}
					>
						<div style={{ padding: 2, flexGrow: 1 }}>
							<Droppable
								data={{ mode: DroppableMode.InsertIn, componentId: ROOT_ID }}
								onClick={deselectComponent}
								style={{
									minHeight: '100%',
									margin: '0 auto',
									transition: 'all 150ms',
									backgroundColor: 'white',
									maxWidth,
								}}
							>
								<RenderComponents components={components} state={{}} />
							</Droppable>
						</div>
					</div>
				</DndFrame>
			</Frame>
		</div>
	)
}
