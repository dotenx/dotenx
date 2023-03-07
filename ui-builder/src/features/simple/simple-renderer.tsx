import { useDidUpdate, useDisclosure, useElementSize } from '@mantine/hooks'
import { Placement } from '@popperjs/core'
import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { TbArrowDown, TbArrowUp, TbTrash } from 'react-icons/tb'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { ImageElement } from '../elements/extensions/image'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { AddElementButton } from './simple-canvas'

export function ElementOverlay({
	children,
	element,
	isDirectRootChildren,
	withoutStyle,
}: {
	children: ReactNode
	element: Element
	isDirectRootChildren?: boolean
	withoutStyle?: boolean
}) {
	const { select, setHovered, unsetHovered } = useSelectionStore((store) => ({
		select: store.select,
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
	}))
	const { isHighlighted, isHovered } = useIsHighlighted(element.id)
	const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
	const [showSettings, showSettingsHandlers] = useDisclosure(false)
	const { isFullscreen } = useAtomValue(previewAtom)
	const handleMouseOver = () => {
		if (isFullscreen) return
		setHovered(element.id)
	}
	const handleMouseEnter = () => {
		if (isFullscreen) return
		showSettingsHandlers.open()
	}
	const handleClick = () => {
		if (!isDirectRootChildren || isFullscreen) return
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
		(el: HTMLDivElement) => {
			setReferenceElement(el)
			ref.current = el
		},
		[ref]
	)

	return (
		<div
			style={{
				outlineWidth: isHovered ? 2 : 1,
				cursor: 'default',
				outlineStyle: isHighlighted && isDirectRootChildren ? 'solid' : undefined,
				outlineColor: '#fb7185',
				width: withoutStyle ? '100%' : undefined,
				...backgroundImage,
			}}
			className={withoutStyle ? undefined : element.generateClasses()}
			ref={handleRef}
			onMouseOver={handleMouseOver}
			onMouseOut={unsetHovered}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={showSettingsHandlers.close}
			onClick={handleClick}
		>
			{children}
			{isDirectRootChildren && showSettings && (
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
		</div>
	)
}

function ElementActions({ element, horizontal }: { element: Element; horizontal: boolean }) {
	const elements = useElementsStore((store) => store.elements)
	const { remove, move } = useElementsStore((store) => ({
		remove: store.remove,
		move: store.move,
	}))
	const isFirst = elements.findIndex((c) => c.id === element.id) === 0
	const isLast = elements.findIndex((c) => c.id === element.id) === elements.length - 1
	const moveUp = () =>
		move(element.id, {
			mode: 'before',
			id: elements[elements.findIndex((e) => e.id === element.id) - 1].id,
		})
	const moveDown = () =>
		move(element.id, {
			mode: 'after',
			id: elements[elements.findIndex((e) => e.id === element.id) + 1].id,
		})

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
				onClick={moveUp}
				disabled={isFirst}
			>
				<TbArrowUp />
			</ActionButton>
			<ActionButton onClick={() => remove([element.id])}>
				<TbTrash />
			</ActionButton>
			<ActionButton
				style={{ borderRadius: '0 0 4px 4px' }}
				onClick={moveDown}
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
		background-color: #eeeeee44;
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
	referenceElement: HTMLDivElement | null
	updateDeps: unknown[]
	placement: Placement
	children: ReactNode
	offset?: [number, number]
}) {
	const { window } = useContext(FrameContext)
	const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
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
