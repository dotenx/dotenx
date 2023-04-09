import { useDidUpdate, useElementSize } from '@mantine/hooks'
import { Placement } from '@popperjs/core'
import { useAtomValue } from 'jotai'
import { MouseEvent, ReactNode, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { TbArrowDown, TbArrowUp, TbTrash } from 'react-icons/tb'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { ImageElement } from '../elements/extensions/image'
import { InputElement } from '../elements/extensions/input'
import { SelectElement } from '../elements/extensions/select'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { AddElementButton } from './simple-canvas'

export function ElementOverlay({
	children,
	element,
	isDirectRootChildren,
	isGridChild,
}: {
	children: ReactNode
	element: Element
	isDirectRootChildren?: boolean
	isGridChild?: boolean
}) {
	const { select, setHovered } = useSelectionStore((store) => ({
		select: store.select,
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
	}))
	const { isHighlighted, isHovered } = useIsHighlighted(element.id)
	const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null)
	const { isFullscreen } = useAtomValue(previewAtom)

	const handleClick = (event: MouseEvent) => {
		if (!(isDirectRootChildren || isGridChild) || isFullscreen) return
		event.stopPropagation()
		select(element.id)
	}

	let backgroundUrl = ''
	if (element instanceof ImageElement) backgroundUrl = element.data.src.toString()
	const backgroundImage = backgroundUrl
		? {
				backgroundImage: `url(${backgroundUrl})`,
				backgroundSize: element.style.desktop?.default?.objectFit ?? 'cover',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
		  }
		: {}

	const { ref, height } = useElementSize()

	const handleRef = useCallback(
		(el: HTMLElement | null) => {
			setReferenceElement(el)
			ref.current = el
		},
		[ref]
	)

	const handleMouseOver = (event: MouseEvent) => {
		if (!(isDirectRootChildren || isGridChild) || isFullscreen) return
		event.stopPropagation()
		setHovered(element.id)
	}

	const hasNoChild = element instanceof InputElement || element instanceof SelectElement
	const Rendered =
		element instanceof InputElement
			? 'input'
			: element instanceof SelectElement
			? 'select'
			: 'div'

	return (
		<>
			<Rendered
				style={{
					outlineWidth: isHovered ? 2 : 1,
					cursor: 'default',
					outlineStyle:
						isHighlighted && (isDirectRootChildren || isGridChild)
							? 'solid'
							: undefined,
					outlineColor: '#fb7185',
					...backgroundImage,
				}}
				className={element.generateClasses()}
				ref={handleRef}
				onMouseEnter={handleMouseOver}
				onClick={handleClick}
				type={element instanceof InputElement ? element.data.type : undefined}
			>
				{!hasNoChild ? children : undefined}
			</Rendered>
			{(isDirectRootChildren || isGridChild) && isHovered && (
				<>
					<ElementOverlayPiece
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="top"
						offset={[0, -16]}
					>
						<AddElementButton insert={{ where: element.id, placement: 'before' }} />
					</ElementOverlayPiece>
					<ElementOverlayPiece
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="bottom"
						offset={[0, -16]}
					>
						<AddElementButton insert={{ where: element.id, placement: 'after' }} />
					</ElementOverlayPiece>
					<ElementOverlayPiece
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="left-start"
						offset={[8, height < 100 ? -80 : -30]}
					>
						<ElementActions element={element} horizontal={height < 100} />
					</ElementOverlayPiece>
				</>
			)}
		</>
	)
}

function ElementActions({ element, horizontal }: { element: Element; horizontal: boolean }) {
	const elements = useElementsStore((store) => store.elements)
	const { remove, moveUp, moveDown } = useElementsStore((store) => ({
		remove: store.remove,
		moveUp: store.moveUp,
		moveDown: store.moveDown,
	}))
	const isFirst = elements.findIndex((c) => c.id === element.id) === 0
	const isLast = elements.findIndex((c) => c.id === element.id) === elements.length - 1

	return (
		<div
			onClick={(event) => event.stopPropagation()}
			style={{
				display: 'flex',
				flexDirection: horizontal ? 'row' : 'column',
			}}
		>
			<ActionButton
				style={{ borderRadius: '4px 4px 0 0' }}
				onClick={() => moveUp(element.id)}
				disabled={isFirst}
			>
				<TbArrowUp />
			</ActionButton>
			<ActionButton onClick={() => remove([element.id])}>
				<TbTrash />
			</ActionButton>
			<ActionButton
				style={{ borderRadius: '0 0 4px 4px' }}
				onClick={() => moveDown(element.id)}
				disabled={isLast}
			>
				<TbArrowDown />
			</ActionButton>
		</div>
	)
}

const ActionButton = styled.button`
	border: none;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 24px;
	width: 24px;
	padding: 0;
	background-color: #eeeeee88;
	:not([disabled]):hover {
		background-color: #eeeeee66;
		cursor: pointer;
	}
`

function ElementOverlayPiece({
	referenceElement,
	updateDeps,
	placement,
	children,
	offset = [0, 0],
}: {
	referenceElement: HTMLElement | null
	updateDeps: unknown[]
	placement: Placement
	children: ReactNode
	offset?: [number, number]
}) {
	const { window } = useContext(FrameContext)
	const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)
	const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
		placement,
		modifiers: [
			{ name: 'offset', options: { offset } },
			{ name: 'flip', options: { mainAxis: false } },
		],
	})
	const targetElement = window?.document.querySelector(`#${ROOT_ID}`) ?? document.body
	useDidUpdate(() => {
		if (update) update()
	}, [update, ...updateDeps])

	return createPortal(
		<div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
			{children}
		</div>,
		targetElement
	)
}
