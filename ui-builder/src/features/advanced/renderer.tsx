import { useIntersection } from '@mantine/hooks'
import { useAtomValue } from 'jotai'
import { Fragment, MouseEvent, ReactNode, useCallback, useContext, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { usePopper } from 'react-popper'
import { CSSProperties } from 'styled-components'
import { animateCSS } from '../../utils/animation'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { DroppableMode } from '../dnd/droppable'
import { DroppablePortal } from '../dnd/droppable-portal'
import { Element } from '../elements/element'
import { ActionKind, AnimationAction, EventKind } from '../elements/event'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'

export function RenderElements({ elements }: { elements: Element[] }) {
	const { isFullscreen } = useAtomValue(previewAtom)

	if (isFullscreen) {
		return (
			<>
				{elements.map((element) => (
					<Fragment key={element.id}>
						{element.renderPreview((element) => (
							<RenderElements elements={element.children ?? []} />
						))}
					</Fragment>
				))}
			</>
		)
	}

	return (
		<>
			{elements.map((element) => (
				<ElementOverlay key={element.id} element={element}>
					{element.render((element) => (
						<RenderElements elements={element.children ?? []} />
					))}
				</ElementOverlay>
			))}
		</>
	)
}

function ElementOverlay({ children, element }: { children: ReactNode; element: Element }) {
	const { isFullscreen } = useAtomValue(previewAtom)
	const { selectElements, selectedElements, setHovered, unsetHovered } = useSelectionStore(
		(store) => ({
			selectElements: store.select,
			selectedElements: store.selectedIds,
			setHovered: store.setHovered,
			unsetHovered: store.unsetHovered,
		})
	)
	const { isHighlighted, isHovered, isSelected } = useIsHighlighted(element.id)
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
	const showHoverAnimations = () => {
		element.events
			.filter((event) => event.kind === EventKind.MouseEnter)
			.flatMap((event) => event.actions)
			.filter((action): action is AnimationAction => action.kind === ActionKind.Animation)
			.forEach((animation) => animateCSS(`.${element.id}`, animation.animationName))
	}
	const intersectionAnimation = intersection.entry?.isIntersecting
		? 'animate__animated ' +
		  element.events
				.filter((event) => event.kind === EventKind.Intersection)
				.flatMap((event) => event.actions)
				.filter((action): action is AnimationAction => action.kind === ActionKind.Animation)
				.map((animation) => `animate__${animation.animationName}`)
		: ''
	const classes = `${element.generateClasses()} ${intersectionAnimation}`
	const style: CSSProperties = {
		cursor: 'default',
		outlineColor: '#fb7185',
		outlineWidth: isHovered ? 2 : 1,
		outlineStyle: isHighlighted ? 'solid' : undefined,
	}
	const handleMouseOver = (event: MouseEvent) => {
		event.stopPropagation()
		if (!isFullscreen) setHovered(element.id)
		showHoverAnimations()
	}
	const handleMouseOut = (event: MouseEvent) => {
		event.stopPropagation()
		unsetHovered()
	}
	const handleClick = (event: MouseEvent) => {
		event.stopPropagation()
		if (isFullscreen) return
		if (event.ctrlKey && !isSelected) selectElements([...selectedElements, element.id])
		else selectElements(element.id)
	}

	return (
		<Draggable
			data={{ mode: DraggableMode.Move, elementId: element.id }}
			ref={handleRef}
			className={classes}
			tabIndex={0}
			id={element.id}
			style={style}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			onClick={handleClick}
		>
			{canContain && (
				<DroppablePortal
					referenceElement={referenceElement}
					data={{ mode: DroppableMode.InsertIn, elementId: element.id }}
					placement="bottom"
					sameWidth
					sameHeight
					center
					updateDeps={[element]}
				/>
			)}
			<DroppablePortal
				referenceElement={referenceElement}
				data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
				style={{ height: '10px' }}
				placement="top"
				sameWidth
				updateDeps={[element]}
			/>
			<DroppablePortal
				referenceElement={referenceElement}
				data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
				style={{ width: '10px' }}
				placement="right"
				sameHeight
				updateDeps={[element]}
			/>
			<DroppablePortal
				referenceElement={referenceElement}
				data={{ mode: DroppableMode.InsertAfter, elementId: element.id }}
				style={{ height: '10px' }}
				placement="bottom"
				sameWidth
				updateDeps={[element]}
			/>
			<DroppablePortal
				referenceElement={referenceElement}
				data={{ mode: DroppableMode.InsertBefore, elementId: element.id }}
				style={{ width: '10px' }}
				placement="left"
				sameHeight
				updateDeps={[element]}
			/>
			{isSelected && <ElementKind element={element} referenceElement={referenceElement} />}
			{children}
		</Draggable>
	)
}

function ElementKind({
	element,
	referenceElement,
}: {
	element: Element
	referenceElement: HTMLDivElement | null
}) {
	const { window } = useContext(FrameContext)
	const targetElement = window?.document.querySelector(`#${ROOT_ID}`) ?? document.body
	const popperElement = useRef<HTMLDivElement>(null)
	const { styles: popperStyles, attributes } = usePopper(referenceElement, popperElement.current)
	const { isHovered } = useIsHighlighted(element.id)

	return createPortal(
		<div
			ref={popperElement}
			style={{
				fontFamily: 'monospace',
				padding: '2px 6px',
				borderRadius: 2,
				border: '1px solid #f43f5e',
				display: 'flex',
				gap: 2,
				alignItems: 'center',
				fontSize: 12,
				fontWeight: 600,
				letterSpacing: 'normal',
				lineHeight: 'normal',
				backgroundColor: isHovered ? '#f43f5e' : 'white',
				zIndex: (isHovered ? 101 : 100) * 1000,
				color: isHovered ? 'white' : '#f43f5e',
				...popperStyles.popper,
			}}
			{...attributes.popper}
		>
			{element.icon}
			{element.name}
		</div>,
		targetElement
	)
}
