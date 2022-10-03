import { ReactNode, useContext, useEffect } from 'react'
import { DndContext } from 'react-dnd'
import { FrameContext } from 'react-frame-component'

export function FrameDnd({ children }: { children: ReactNode }) {
	const { dragDropManager } = useContext(DndContext)
	const { window } = useContext(FrameContext)

	useEffect(() => {
		const backend = dragDropManager?.getBackend() as any
		backend.addEventListeners(window)
	})

	return <>{children}</>
}
