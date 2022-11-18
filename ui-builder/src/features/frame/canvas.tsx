import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'
import Frame, { FrameContextConsumer } from 'react-frame-component'
import { StyleSheetManager } from 'styled-components'
import { customCodesAtom } from '../page/actions'
import { pageScaleAtom, previewAtom } from '../page/top-bar'
import { useCanvasMaxWidth } from '../viewport/viewport-store'
import { FrameHotkeys } from './hotkey'
import { FrameHead } from './style'

export const ROOT_ID = 'CANVAS_ROOT'

export function CanvasFrame({ children }: { children: ReactNode }) {
	const maxWidth = useCanvasMaxWidth()
	const { isFullscreen } = useAtomValue(previewAtom)
	const pageScale = useAtomValue(pageScaleAtom)
	const customCodes = useAtomValue(customCodesAtom)

	return (
		<div className="h-full bg-gray-50">
			<div className="h-full mx-auto" style={{ maxWidth }}>
				<Frame className="w-full min-h-full h-full" head={<FrameHead />}>
					<FrameHotkeys>
						<FrameContextConsumer>
							{(frameContext) => (
								<StyleSheetManager target={frameContext.document?.head}>
									<div
										id={ROOT_ID}
										style={{
											padding: isFullscreen ? 0 : 3,
											transform: `scale(${pageScale})`,
											backgroundColor: 'white',
											transitionProperty: 'transform',
											transitionTimingFunction:
												'cubic-bezier(0.4, 0, 0.2, 1)',
											transitionDuration: '150ms',
											borderRadius: 4,
										}}
									>
										{children}
									</div>
								</StyleSheetManager>
							)}
						</FrameContextConsumer>
					</FrameHotkeys>
					<script>{customCodes.footer}</script>
				</Frame>
			</div>
		</div>
	)
}
