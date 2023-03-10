import { atom, useAtom, useAtomValue } from 'jotai'
import {
	CSSProperties,
	MouseEvent,
	ReactNode,
	RefObject,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { animateCSS } from '../../utils/animation'
import { AnimationAction } from '../actions/action'
import { Draggable, DraggableInput, DraggableMode } from '../dnd/draggable'
import { DroppableMode } from '../dnd/droppable'
import { DroppablePortal } from '../dnd/droppable-portal'
import { Element } from '../elements/element'
import { EventKind } from '../elements/event'
import { ImageElement } from '../elements/extensions/image'
import { PictureElement } from '../elements/extensions/picture'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { viewportAtom } from '../viewport/viewport-store'

const DraggableNoFocus = styled(Draggable)`
	:focus {
		outline: none;
	}
`

const DraggableInputNoFocus = styled(DraggableInput)`
	:focus {
		outline: none;
	}
`

export const hoveringAtom = atom<{ elementId: string | null }>({ elementId: null })

export function ElementOverlay({
	children,
	element,
	parentHidden,
	withoutStyle,
}: {
	children: ReactNode
	element: Element
	parentHidden?: boolean
	withoutStyle?: boolean
}) {
	if (withoutStyle) return <InputOverlay element={element} parentHidden={parentHidden} />
	return (
		<BoxOverlay element={element} parentHidden={parentHidden}>
			{children}
		</BoxOverlay>
	)
}

function BoxOverlay({
	children,
	element,
	parentHidden,
}: {
	children: ReactNode
	element: Element
	parentHidden?: boolean
}) {
	const invisible = parentHidden || element.hidden
	const viewPort = useAtomValue(viewportAtom)
	const [hovering, setHovering] = useAtom(hoveringAtom)
	const isHovered = hovering.elementId === element.id
	const styles = useAppliedStyle(element)
	const { isFullscreen } = useAtomValue(previewAtom)
	const { selectElements, selectedElements } = useSelectionStore((store) => ({
		selectElements: store.select,
		selectedElements: store.selectedIds,
	}))
	const { isSelected } = useIsHighlighted(element.id)
	const isHighlighted = isSelected || isHovered
	const canContain = element.isContainer()
	const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
	const handleRef = useCallback((event: HTMLDivElement) => {
		setReferenceElement(event)
	}, [])
	const showHoverAnimations = useCallback(() => {
		element.events
			.filter((event) => event.kind === EventKind.MouseEnter)
			.flatMap((event) => event.actions)
			.filter((action): action is AnimationAction => action instanceof AnimationAction)
			.forEach((animation) => animateCSS(`.${element.id}`, animation.animationName))
	}, [element.events, element.id])
	const animations = useMemo(
		() =>
			'animate__animated ' +
			element.events
				.flatMap((event) => event.actions)
				.filter((action): action is AnimationAction => action instanceof AnimationAction)
				.map((animation) => `animate__${animation.animationName}`),
		[element.events]
	)

	const classes = `${element.generateClasses()} ${animations}`

	const handleMouseOver = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			if (!isFullscreen) setHovering({ elementId: element.id })
			showHoverAnimations()
		},
		[element.id, isFullscreen, setHovering, showHoverAnimations]
	)
	const handleMouseOut = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			setHovering({ elementId: null })
		},
		[setHovering]
	)
	const handleClick = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			if (isFullscreen) return
			if (event.ctrlKey && !isSelected) selectElements([...selectedElements, element.id])
			else selectElements(element.id)
			document.getElementById(element.id)?.scrollIntoView({ behavior: 'smooth' })
		},
		[element.id, isFullscreen, isSelected, selectElements, selectedElements]
	)

	let backgroundUrl = ''
	if (element instanceof ImageElement) backgroundUrl = element.data.src.toString()
	if (element instanceof PictureElement) {
		backgroundUrl =
			viewPort === 'desktop'
				? element.data.desktopSrc
				: viewPort === 'tablet'
				? element.data.tabletSrc || element.data.desktopSrc
				: element.data.mobileSrc || element.data.tabletSrc || element.data.desktopSrc
	}
	const style: CSSProperties = useMemo(
		() => ({
			cursor: 'default',
			outlineColor: '#fb7185',
			outlineWidth: isSelected ? 2 : 1,
			outlineStyle: isHighlighted ? 'solid' : undefined,
			visibility: invisible ? 'hidden' : undefined,
			minHeight: canContain && element.children?.length === 0 ? 100 : undefined,
			minWidth: canContain && element.children?.length === 0 ? 100 : undefined,
		}),
		[canContain, element.children?.length, invisible, isHighlighted, isSelected]
	)
	const backgroundImage = useMemo(
		() =>
			backgroundUrl
				? {
						backgroundImage: `url(${backgroundUrl})`,
						backgroundSize: styles?.objectFit ? styles?.objectFit : 'contain',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: 'center',
				  }
				: {},
		[backgroundUrl, styles?.objectFit]
	)

	const draggableData = useMemo(
		() => ({ mode: DraggableMode.Move as const, elementId: element.id }),
		[element.id]
	)
	const draggableStyle = useMemo(
		() => ({ ...style, ...backgroundImage }),
		[backgroundImage, style]
	)
	const { window } = useContext(FrameContext)
	const targetElement = window?.document.querySelector(`#${ROOT_ID}`) ?? document.body

	return (
		<DraggableNoFocus
			ref={handleRef}
			data={draggableData}
			className={classes}
			tabIndex={0}
			id={element.id}
			style={draggableStyle}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onClick={handleClick}
		>
			{!invisible && (
				<>
					{canContain && !invisible && (
						<DroppablePortal
							referenceElement={referenceElement}
							data={{ mode: DroppableMode.InsertIn, elementId: element.id }}
							overStyle={{ boxShadow: 'inset 0px 0px 0px 3px #fb7185' }}
							placement="bottom"
							fullWidth
							fullHeight
							center
							updateDeps={[element]}
							targetElement={targetElement}
						/>
					)}
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
						style={{ height: '10px' }}
						overStyle={{ boxShadow: 'inset 0px 3px 0px 0px #fb7185' }}
						placement="top"
						fullWidth
						halfHeight={!canContain}
						center={!canContain}
						updateDeps={[element]}
						targetElement={targetElement}
					/>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
						style={{ width: '10px' }}
						overStyle={{ boxShadow: 'inset -3px 0px 0px 0px #fb7185' }}
						placement="right"
						fullHeight
						updateDeps={[element]}
						targetElement={targetElement}
					/>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
						style={{ height: '10px' }}
						overStyle={{ boxShadow: 'inset 0px -3px 0px 0px #fb7185' }}
						placement="bottom"
						fullWidth
						halfHeight={!canContain}
						center={!canContain}
						updateDeps={[element]}
						targetElement={targetElement}
					/>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
						style={{ width: '10px' }}
						overStyle={{ boxShadow: 'inset 3px 0px 0px 0px #fb7185' }}
						placement="left"
						fullHeight
						updateDeps={[element]}
						targetElement={targetElement}
					/>
				</>
			)}
			<ElementKindWrapper
				element={element}
				referenceElement={referenceElement}
				isHovered={isHovered}
				isSelected={isSelected}
			/>
			{children}
		</DraggableNoFocus>
	)
}

function InputOverlay({ element, parentHidden }: { element: Element; parentHidden?: boolean }) {
	const invisible = parentHidden || element.hidden
	const viewPort = useAtomValue(viewportAtom)
	const [hovering, setHovering] = useAtom(hoveringAtom)
	const isHovered = hovering.elementId === element.id
	const styles = useAppliedStyle(element)
	const { isFullscreen } = useAtomValue(previewAtom)
	const { selectElements, selectedElements } = useSelectionStore((store) => ({
		selectElements: store.select,
		selectedElements: store.selectedIds,
	}))
	const { isSelected } = useIsHighlighted(element.id)
	const isHighlighted = isSelected || isHovered
	const canContain = element.isContainer()
	const [referenceElement, setReferenceElement] = useState<HTMLInputElement | null>(null)
	const handleRef = useCallback((event: HTMLInputElement) => {
		setReferenceElement(event)
	}, [])
	const showHoverAnimations = useCallback(() => {
		element.events
			.filter((event) => event.kind === EventKind.MouseEnter)
			.flatMap((event) => event.actions)
			.filter((action): action is AnimationAction => action instanceof AnimationAction)
			.forEach((animation) => animateCSS(`.${element.id}`, animation.animationName))
	}, [element.events, element.id])
	const animations = useMemo(
		() =>
			'animate__animated ' +
			element.events
				.flatMap((event) => event.actions)
				.filter((action): action is AnimationAction => action instanceof AnimationAction)
				.map((animation) => `animate__${animation.animationName}`),
		[element.events]
	)

	const classes = `${element.generateClasses()} ${animations}`

	const handleMouseOver = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			if (!isFullscreen) setHovering({ elementId: element.id })
			showHoverAnimations()
		},
		[element.id, isFullscreen, setHovering, showHoverAnimations]
	)
	const handleMouseOut = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			setHovering({ elementId: null })
		},
		[setHovering]
	)
	const handleClick = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			if (isFullscreen) return
			if (event.ctrlKey && !isSelected) selectElements([...selectedElements, element.id])
			else selectElements(element.id)
			document.getElementById(element.id)?.scrollIntoView({ behavior: 'smooth' })
		},
		[element.id, isFullscreen, isSelected, selectElements, selectedElements]
	)

	let backgroundUrl = ''
	if (element instanceof ImageElement) backgroundUrl = element.data.src.toString()
	if (element instanceof PictureElement) {
		backgroundUrl =
			viewPort === 'desktop'
				? element.data.desktopSrc
				: viewPort === 'tablet'
				? element.data.tabletSrc || element.data.desktopSrc
				: element.data.mobileSrc || element.data.tabletSrc || element.data.desktopSrc
	}
	const style: CSSProperties = useMemo(
		() => ({
			cursor: 'default',
			outlineColor: '#fb7185',
			outlineWidth: isSelected ? 2 : 1,
			outlineStyle: isHighlighted ? 'solid' : undefined,
			visibility: invisible ? 'hidden' : undefined,
			minHeight: canContain && element.children?.length === 0 ? 100 : undefined,
			minWidth: canContain && element.children?.length === 0 ? 100 : undefined,
		}),
		[canContain, element.children?.length, invisible, isHighlighted, isSelected]
	)
	const backgroundImage = useMemo(
		() =>
			backgroundUrl
				? {
						backgroundImage: `url(${backgroundUrl})`,
						backgroundSize: styles?.objectFit ? styles?.objectFit : 'contain',
						backgroundRepeat: 'no-repeat',
						backgroundPosition: 'center',
				  }
				: {},
		[backgroundUrl, styles?.objectFit]
	)

	const draggableData = useMemo(
		() => ({ mode: DraggableMode.Move as const, elementId: element.id }),
		[element.id]
	)
	const draggableStyle = useMemo(
		() => ({ ...style, ...backgroundImage }),
		[backgroundImage, style]
	)
	const { window } = useContext(FrameContext)
	const targetElement = window?.document.querySelector(`#${ROOT_ID}`) ?? document.body

	return (
		<>
			<DraggableInputNoFocus
				ref={handleRef}
				data={draggableData}
				className={classes}
				tabIndex={0}
				id={element.id}
				style={draggableStyle}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				onClick={handleClick}
			/>
			{!invisible && (
				<>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
						style={{ height: '10px' }}
						overStyle={{ boxShadow: 'inset 0px 3px 0px 0px #fb7185' }}
						placement="top"
						fullWidth
						halfHeight={!canContain}
						center={!canContain}
						updateDeps={[element]}
						targetElement={targetElement}
					/>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
						style={{ width: '10px' }}
						overStyle={{ boxShadow: 'inset -3px 0px 0px 0px #fb7185' }}
						placement="right"
						fullHeight
						updateDeps={[element]}
						targetElement={targetElement}
					/>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
						style={{ height: '10px' }}
						overStyle={{ boxShadow: 'inset 0px -3px 0px 0px #fb7185' }}
						placement="bottom"
						fullWidth
						halfHeight={!canContain}
						center={!canContain}
						updateDeps={[element]}
						targetElement={targetElement}
					/>
					<DroppablePortal
						referenceElement={referenceElement}
						data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
						style={{ width: '10px' }}
						overStyle={{ boxShadow: 'inset 3px 0px 0px 0px #fb7185' }}
						placement="left"
						fullHeight
						updateDeps={[element]}
						targetElement={targetElement}
					/>
				</>
			)}
			<ElementKindWrapper
				element={element}
				referenceElement={referenceElement}
				isHovered={isHovered}
				isSelected={isSelected}
			/>
		</>
	)
}

function ElementKindWrapper({
	element,
	referenceElement,
	isHovered,
	isSelected,
}: {
	element: Element
	referenceElement: HTMLDivElement | null
	isHovered: boolean
	isSelected: boolean
}) {
	const { window } = useContext(FrameContext)
	const targetElement = window?.document.querySelector(`#${ROOT_ID}`)
	const popperElement = useRef<HTMLDivElement | null>(null)

	if (!targetElement || !referenceElement) return null

	return (
		<ElementKind
			element={element}
			referenceElement={referenceElement}
			popperElement={popperElement}
			isHovered={isHovered}
			isSelected={isSelected}
			targetElement={targetElement}
		/>
	)
}

function ElementKind({
	element,
	referenceElement,
	popperElement,
	isHovered,
	isSelected,
	targetElement,
}: {
	element: Element
	referenceElement: HTMLDivElement
	popperElement: RefObject<HTMLDivElement>
	isHovered: boolean
	isSelected: boolean
	targetElement: globalThis.Element
}) {
	const {
		styles: popperStyles,
		attributes,
		update,
	} = usePopper(referenceElement, popperElement.current)

	useEffect(() => {
		if (update && (isSelected || isHovered)) update()
	}, [element, isHovered, isSelected, update])

	return createPortal(
		<div
			ref={popperElement}
			style={{
				fontFamily: 'monospace',
				padding: '2px 6px',
				borderRadius: 2,
				border: '1px solid #f43f5e',
				gap: 2,
				alignItems: 'center',
				fontSize: 12,
				fontWeight: 600,
				letterSpacing: 'normal',
				lineHeight: 'normal',
				backgroundColor: isSelected ? '#f43f5e' : 'white',
				zIndex: (isHovered ? 101 : 100) * 1000,
				color: isSelected ? 'white' : '#f43f5e',
				...popperStyles.popper,
				display: (isSelected || isHovered) && popperElement.current ? 'flex' : 'none',
			}}
			{...attributes.popper}
		>
			{element.icon}
			{element.name}
		</div>,
		targetElement
	)
}

function useAppliedStyle(element: Element) {
	const viewport = useAtomValue(viewportAtom)
	const style = element.style[viewport]?.default
	return style
}
