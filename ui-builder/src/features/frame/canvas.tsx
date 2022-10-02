import { ReactNode } from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { StyleSheetManager } from 'styled-components'
import { useCanvasMaxWidth } from '../viewport/viewport-store'
import { FrameHotkeys } from './hotkey'
import { FrameStyles } from './style'

export const ROOT_ID = 'CANVAS_ROOT'

export function CanvasFrame({ children }: { children: ReactNode }) {
	const maxWidth = useCanvasMaxWidth()

	return (
		<div className="h-full bg-gray-50">
			<div className="h-full mx-auto bg-white" style={{ maxWidth }}>
				<Frame className="w-full h-full" head={<FrameStyles />}>
					<FrameHotkeys>
						<FrameContextConsumer>
							{(frameContext) => (
								<StyleSheetManager target={frameContext.document?.head}>
									<div id={ROOT_ID} style={{ padding: 3 }}>
										{children}
									</div>
								</StyleSheetManager>
							)}
						</FrameContextConsumer>
					</FrameHotkeys>
				</Frame>
			</div>
		</div>
	)
}
