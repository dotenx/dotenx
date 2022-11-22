import { useIntersection } from '@mantine/hooks'
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
	useState
} from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { animateCSS } from '../../utils/animation'
import { AnimationAction } from '../actions/action'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { DroppableMode } from '../dnd/droppable'
import { DroppablePortal } from '../dnd/droppable-portal'
import { Element } from '../elements/element'
import { EventKind } from '../elements/event'
import { ImageElement } from '../elements/extensions/image'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { viewportAtom } from '../viewport/viewport-store'

const DraggableNoFocus = styled(Draggable)`
	:focus {
		outline: none;
	}
`

export const hoveringAtom = atom<{ elementId: string | null }>({ elementId: null })

export function ElementOverlay({ children, element }: { children: ReactNode; element: Element }) {
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
	const intersection = useIntersection()
	const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
	const intersectionRef = intersection.ref
	const handleRef = useCallback(
		(event: HTMLDivElement) => {
			intersectionRef(event)
			setReferenceElement(event)
		},
		[intersectionRef]
	)
	const showHoverAnimations = useCallback(() => {
		element.events
			.filter((event) => event.kind === EventKind.MouseEnter)
			.flatMap((event) => event.actions)
			.filter((action): action is AnimationAction => action instanceof AnimationAction)
			.forEach((animation) => animateCSS(`.${element.id}`, animation.animationName))
	}, [element.events, element.id])
	const intersectionAnimation = intersection.entry?.isIntersecting
		? 'animate__animated ' +
		  element.events
				.filter((event) => event.kind === EventKind.Intersection)
				.flatMap((event) => event.actions)
				.filter((action): action is AnimationAction => action instanceof AnimationAction)
				.map((animation) => `animate__${animation.animationName}`)
		: ''
	const classes = `${element.generateClasses()} ${intersectionAnimation}`

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
	const style: CSSProperties = useMemo(
		() => ({
			cursor: 'default',
			outlineColor: '#fb7185',
			outlineWidth: isSelected ? 2 : 1,
			outlineStyle: isHighlighted ? 'solid' : undefined,
		}),
		[isHighlighted, isSelected]
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
			{canContain && (
				<DroppablePortal
					referenceElement={referenceElement}
					data={{ mode: DroppableMode.InsertIn, elementId: element.id }}
					overStyle={{ boxShadow: 'inset 0px 0px 0px 3px #fb7185' }}
					placement="bottom"
					fullWidth
					fullHeight
					center
					updateDeps={[element]}
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
			/>
			<DroppablePortal
				referenceElement={referenceElement}
				data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
				style={{ width: '10px' }}
				overStyle={{ boxShadow: 'inset -3px 0px 0px 0px #fb7185' }}
				placement="right"
				fullHeight
				updateDeps={[element]}
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
			/>
			<DroppablePortal
				referenceElement={referenceElement}
				data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
				style={{ width: '10px' }}
				overStyle={{ boxShadow: 'inset 3px 0px 0px 0px #fb7185' }}
				placement="left"
				fullHeight
				updateDeps={[element]}
			/>
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
