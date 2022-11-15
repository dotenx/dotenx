import { useIntersection } from '@mantine/hooks'
import produce from 'immer'
import { useAtomValue } from 'jotai'
import _ from 'lodash'
import { MouseEvent, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { usePopper } from 'react-popper'
import { CSSProperties } from 'styled-components'
import { AnyJson, JsonArray } from '../../utils'
import { animateCSS } from '../../utils/animation'
import { AnimationAction } from '../actions/action'
import { Draggable, DraggableMode } from '../dnd/draggable'
import { DroppableMode } from '../dnd/droppable'
import { DroppablePortal } from '../dnd/droppable-portal'
import { Element } from '../elements/element'
import { EventKind } from '../elements/event'
import { ImageElement } from '../elements/extensions/image'
import { TextElement } from '../elements/extensions/text'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { Expression, ExpressionKind } from '../states/expression'
import { States, usePageStateStore } from '../states/page-states-store'
import { inteliText } from '../ui/intelinput'
import { viewportAtom } from '../viewport/viewport-store'

export function RenderElements({
	elements,
	states,
	overlay,
	isDirectRootChildren,
}: {
	elements: Element[]
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
}) {
	return (
		<>
			{elements.map((element) => (
				<RenderElement
					key={element.id}
					element={element}
					states={states}
					overlay={overlay}
					isDirectRootChildren={isDirectRootChildren}
				/>
			))}
		</>
	)
}

export type Overlay = (props: {
	children: ReactNode
	element: Element
	isDirectRootChildren?: boolean
}) => JSX.Element

function RenderElement({
	element,
	states,
	overlay,
	isDirectRootChildren,
}: {
	element: Element
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
}) {
	const { isFullscreen } = useAtomValue(previewAtom)

	if (isFullscreen) {
		return (
			<RenderElementPreview
				element={element}
				states={states}
				overlay={overlay}
				isDirectRootChildren={isDirectRootChildren}
			/>
		)
	}

	const Overlay = overlay

	return (
		<Overlay element={element} isDirectRootChildren={isDirectRootChildren}>
			<>
				{element.render((element) => (
					<RenderElements
						elements={element.children ?? []}
						states={states}
						overlay={overlay}
					/>
				))}
			</>
		</Overlay>
	)
}

function RenderElementPreview({
	element,
	states,
	overlay,
	isDirectRootChildren,
}: {
	element: Element
	states?: AnyJson
	overlay: Overlay
	isDirectRootChildren?: boolean
}) {
	const pageStates = usePageStateStore((store) => store.states)

	if (element.repeatFrom) {
		const items =
			(_.get(
				pageStates,
				element.repeatFrom.name.replace('$store.source.', '')
			) as JsonArray) ?? []
		return (
			<>
				{items.map((item, index) => (
					<RenderElement
						isDirectRootChildren={isDirectRootChildren}
						key={index}
						element={produce(element, (draft) => {
							draft.repeatFrom = null
						})}
						states={item}
						overlay={overlay}
					/>
				))}
			</>
		)
	}

	if (
		element instanceof TextElement &&
		element.data.text.value.some((part) => part.kind === ExpressionKind.State)
	) {
		const evaluatedText = evaluateExpression(element.data.text, states, pageStates)
		const valuedElement = produce(element, (draft) => {
			draft.data.text = inteliText(evaluatedText)
		})
		return (
			<RenderElement
				isDirectRootChildren={isDirectRootChildren}
				key={element.id}
				element={valuedElement}
				overlay={overlay}
			/>
		)
	}

	if (
		element instanceof ImageElement &&
		element.data.src.value.some((part) => part.kind === ExpressionKind.State)
	) {
		const evaluatedText = evaluateExpression(element.data.src, states, pageStates)
		const valuedElement = produce(element, (draft) => {
			draft.data.src = inteliText(evaluatedText)
		})
		return (
			<RenderElement
				isDirectRootChildren={isDirectRootChildren}
				key={element.id}
				element={valuedElement}
				overlay={overlay}
			/>
		)
	}

	let backgroundUrl = ''
	if (element instanceof ImageElement) {
		backgroundUrl = element.data.src.toString()
	}
	const style = backgroundUrl
		? {
				backgroundImage: `url(${backgroundUrl})`,
				backgroundSize: 'contain',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
		  }
		: {}

	return (
		<>
			{element.renderPreview(
				(element) => (
					<RenderElements
						elements={element.children ?? []}
						states={states}
						overlay={overlay}
					/>
				),
				style
			)}
		</>
	)
}

function evaluateExpression(
	expression: Expression,
	states: AnyJson | undefined,
	pageStates: States
) {
	return expression.value
		.map((part) => {
			if (part.kind === ExpressionKind.Text) return part.value
			const splitPath = part.value.name.split('.')
			const textValue =
				_.get(
					states,
					splitPath.splice(splitPath.findIndex((p) => p.endsWith('Item')) + 1)
				) ?? _.get(pageStates, part.value.name.replace('$store.source.', ''))
			return textValue as string
		})
		.join('')
}

export function ElementOverlay({ children, element }: { children: ReactNode; element: Element }) {
	const styles = useAppliedStyle(element)
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
			if (!isFullscreen) setHovered(element.id)
			showHoverAnimations()
		},
		[element.id, isFullscreen, setHovered, showHoverAnimations]
	)
	const handleMouseOut = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			unsetHovered()
		},
		[unsetHovered]
	)
	const handleClick = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation()
			if (isFullscreen) return
			if (event.ctrlKey && !isSelected) selectElements([...selectedElements, element.id])
			else selectElements(element.id)
		},
		[element.id, isFullscreen, isSelected, selectElements, selectedElements]
	)

	let backgroundUrl = ''
	if (element instanceof ImageElement) backgroundUrl = element.data.src.toString()
	const style: CSSProperties = useMemo(
		() => ({
			cursor: 'default',
			outlineColor: '#fb7185',
			outlineWidth: isHovered ? 2 : 1,
			outlineStyle: isHighlighted ? 'solid' : undefined,
		}),
		[isHighlighted, isHovered]
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
		<Draggable
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

function useAppliedStyle(element: Element) {
	const viewport = useAtomValue(viewportAtom)
	const style = element.style[viewport]?.default
	return style
}
