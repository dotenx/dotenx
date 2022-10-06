import { useDidUpdate, useDisclosure } from '@mantine/hooks'
import { Placement } from '@popperjs/core'
import { useAtomValue } from 'jotai'
import { Fragment, ReactNode, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { TbArrowDown, TbArrowUp, TbTrash } from 'react-icons/tb'
import { usePopper } from 'react-popper'
import styled from 'styled-components'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { ROOT_ID } from '../frame/canvas'
import { previewAtom } from '../page/top-bar'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { AddElementButton } from './simple-canvas'

export function RenderElements({
	elements,
	isDirectRootChildren = false,
}: {
	elements: Element[]
	isDirectRootChildren?: boolean
}) {
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
				<RenderElement
					key={element.id}
					element={element}
					isDirectRootChild={isDirectRootChildren}
				/>
			))}
		</>
	)
}

function RenderElement({
	element,
	isDirectRootChild,
}: {
	element: Element
	isDirectRootChild: boolean
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
		if (!isDirectRootChild || isFullscreen) return
		select(element.id)
	}

	return (
		<div
			style={{
				outlineWidth: isHovered ? 2 : 1,
				cursor: 'default',
				outlineStyle: isHighlighted && isDirectRootChild ? 'solid' : undefined,
				outlineColor: '#fb7185',
			}}
			className={element.generateClasses()}
			ref={setReferenceElement}
			onMouseOver={handleMouseOver}
			onMouseOut={unsetHovered}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={showSettingsHandlers.close}
			onClick={handleClick}
		>
			{element.render((element) => (
				<RenderElements elements={element.children ?? []} />
			))}
			{isDirectRootChild && showSettings && (
				<>
					<ElementOverlay
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="top"
						offset={[0, -15]}
					>
						<AddElementButton insert={{ where: element.id, placement: 'before' }} />
					</ElementOverlay>
					<ElementOverlay
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="bottom"
						offset={[0, -15]}
					>
						<AddElementButton insert={{ where: element.id, placement: 'after' }} />
					</ElementOverlay>
					<ElementOverlay
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="left-start"
						offset={[8, -30]}
					>
						<ElementActions element={element} />
					</ElementOverlay>
				</>
			)}
		</div>
	)
}

function ElementActions({ element }: { element: Element }) {
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
		<div>
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

function ElementOverlay({
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
		modifiers: [{ name: 'offset', options: { offset } }],
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
