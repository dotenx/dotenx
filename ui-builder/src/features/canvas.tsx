import { useSetAtom } from 'jotai'
import _ from 'lodash'
import { ReactNode, useContext, useEffect } from 'react'
import { DndContext } from 'react-dnd'
import Frame, { FrameContext } from 'react-frame-component'
import { mapStyleToKebabCase } from '../api/mapper'
import { Component, CssSelector, SelectorStyle, Style, useCanvasStore } from './canvas-store'
import { selectedClassAtom } from './class-editor'
import { useClassNamesStore } from './class-names-store'
import { RenderComponents } from './component-renderer'
import { Droppable, DroppableMode } from './droppable'
import { useSelectionStore } from './selection-store'
import { useViewportStore, ViewportDevice } from './viewport-store'

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
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const viewport = useViewportStore((store) => store.device)
	const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '48rem' : '28rem'
	const classNames = useClassNamesStore((store) => store.classNames)

	const desktopIds = generateCssIds(components, 'desktop')
	const tabletIds = generateCssIds(components, 'tablet')
	const mobileIds = generateCssIds(components, 'mobile')

	const desktopClasses = generateCssClasses(classNames, 'desktop')
	const tabletClasses = generateCssClasses(classNames, 'tablet')
	const mobileClasses = generateCssClasses(classNames, 'mobile')

	return (
		<div className="h-full bg-gray-50 p-px">
			<Frame
				className="h-full w-full"
				head={
					<>
						<link
							rel="stylesheet"
							href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
						/>
					</>
				}
			>
				<DndFrame>
					<style>{`body { margin: 0; font-family: sans-serif; }`}</style>
					<style>
						{desktopClasses}
						{`@media (max-width: 767px) { ${tabletClasses} }`}
						{`@media (max-width: 478px) { ${mobileClasses} }`}
						{desktopIds}
						{`@media (max-width: 767px) { ${tabletIds} }`}
						{`@media (max-width: 478px) { ${mobileIds} }`}
					</style>
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
								onClick={() => {
									deselectComponent()
									setSelectedClass(null)
								}}
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

const generateCssIds = (components: Component[], device: ViewportDevice) => {
	return flatComponents(components)
		.map((component) => generateCssId(component.id, component.data.style[device]))
		.join('\n')
}

const flatComponents = (components: Component[]): Component[] => {
	return components
		.map((component) => [component, ...flatComponents(component.components)])
		.flat()
}

const generateCssId = (id: string, styles: SelectorStyle) => {
	return _.toPairs(styles)
		.map(([selector, style]) => {
			const cssSelector = selector === CssSelector.Default ? '' : `:${selector}`
			const stringifiedStyles = stylesToString(mapStyleToKebabCase(style))
			return `.${id}${cssSelector} { ${stringifiedStyles} }`
		})
		.join('\n')
}

const generateCssClasses = (classNames: Record<string, Style>, viewport: ViewportDevice) => {
	return _.toPairs(classNames)
		.map(([className, styles]) =>
			_.toPairs(styles[viewport])
				.map(([selector, style]) => {
					const cssSelector = selector === CssSelector.Default ? '' : `:${selector}`
					const stringifiedStyles = stylesToString(mapStyleToKebabCase(style))
					return `.${className}${cssSelector} { ${stringifiedStyles} }`
				})
				.join('\n')
		)
		.join('\n')
}

const stylesToString = (styles: Record<string, string>) => {
	return _.toPairs(styles)
		.map(([key, value]) => `${key}: ${value};`)
		.join(' ')
}
