import { getHotkeyHandler, useHotkeys } from '@mantine/hooks'
import { useSetAtom } from 'jotai'
import _ from 'lodash'
import { ReactNode, useContext, useEffect } from 'react'
import { DndContext } from 'react-dnd'
import Frame, { FrameContext } from 'react-frame-component'
import { mapStyleToKebabCase } from '../api/mapper'
import {
	Component,
	CssSelector,
	isContainer,
	SelectorStyle,
	Style,
	useCanvasStore,
} from './canvas-store'
import { selectedClassAtom } from './class-editor'
import { useClassNamesStore } from './class-names-store'
import { useClipboardStore } from './clipboard'
import { RenderComponents } from './component-renderer'
import { Droppable, DroppableMode, regenComponent } from './droppable'
import { useSelectionStore } from './selection-store'
import { useSelectedComponent } from './use-selected-component'
import { useViewportStore, ViewportDevice } from './viewport-store'

export const ROOT_ID = 'root'

const DndFrame = ({ children }: { children: ReactNode }) => {
	const { dragDropManager } = useContext(DndContext)
	const { window } = useContext(FrameContext)
	const { undo, redo } = useCanvasStore((store) => ({
		undo: store.undo,
		redo: store.redo,
	}))
	const { copy, paste } = useCopyPaste()

	useEffect(() => {
		const backend = dragDropManager?.getBackend() as any
		backend.addEventListeners(window)
	})

	useEffect(() => {
		const hotkeys = getHotkeyHandler([
			['mod+z', undo],
			['mod+shift+z', redo],
			['mod+c', copy],
			['mod+v', paste],
		])
		window?.document.body.addEventListener('keydown', hotkeys)
		return () => window?.document.body.removeEventListener('keydown', hotkeys)
	}, [copy, paste, redo, undo, window?.document.body])

	return <>{children}</>
}

const useCopyPaste = () => {
	const clipboard = useClipboardStore()
	const selectedComponent = useSelectedComponent()
	const addComponent = useCanvasStore((store) => store.addComponent)

	const copy = () => {
		if (selectedComponent) clipboard.copy(selectedComponent)
	}

	const paste = () => {
		if (!clipboard.copiedComponent) return
		const parentId =
			selectedComponent && isContainer(selectedComponent.kind)
				? selectedComponent.id
				: ROOT_ID
		const newComponent = regenComponent(clipboard.copiedComponent, parentId)
		addComponent(newComponent, parentId)
	}

	return { copy, paste }
}

export function Canvas() {
	const { components, undo, redo } = useCanvasStore((store) => ({
		components: store.components,
		undo: store.undo,
		redo: store.redo,
	}))
	const deselectComponent = useSelectionStore((store) => store.deselect)
	const setSelectedClass = useSetAtom(selectedClassAtom)
	const viewport = useViewportStore((store) => store.device)
	const maxWidth = viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '766px' : '477px'
	const classNames = useClassNamesStore((store) => store.classNames)
	const { copy, paste } = useCopyPaste()

	useHotkeys([
		['Escape', deselectComponent],
		['mod+z', undo],
		['mod+shift+z', redo],
		['mod+c', copy],
		['mod+v', paste],
	])

	const desktopIds = generateCssIds(components, 'desktop')
	const tabletIds = generateCssIds(components, 'tablet')
	const mobileIds = generateCssIds(components, 'mobile')

	const desktopClasses = generateCssClasses(classNames, 'desktop')
	const tabletClasses = generateCssClasses(classNames, 'tablet')
	const mobileClasses = generateCssClasses(classNames, 'mobile')

	return (
		<div className="h-full p-px bg-gray-50">
			<div className="h-full mx-auto" style={{ maxWidth }}>
				<Frame
					className="w-full h-full"
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
						<style>{`
						body { margin: 0; font-family: sans-serif; }
						html {
							box-sizing: border-box;
						}
						*, *:before, *:after {
							box-sizing: inherit;
						}
					`}</style>
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
