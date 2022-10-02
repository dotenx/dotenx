import { useDidUpdate, useDisclosure, useHotkeys } from '@mantine/hooks'
import { Placement } from '@popperjs/core'
import { atom, useSetAtom } from 'jotai'
import { ReactNode, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import Frame, { FrameContext, FrameContextConsumer } from 'react-frame-component'
import { TbArrowDown, TbArrowUp, TbPlus, TbTrash } from 'react-icons/tb'
import { usePopper } from 'react-popper'
import styled, { StyleSheetManager } from 'styled-components'
import { Element } from '../elements/element'
import { useElementsStore } from '../elements/elements-store'
import { ROOT_ID } from '../frame/canvas'
import { FrameHotkeys } from '../frame/hotkey'
import { useCanvasHotkeys } from '../hotkey/hotkeys'
import { useIsHighlighted, useSelectionStore } from '../selection/selection-store'
import { useGenerateStyles } from '../style/generate-styles'
import { useCanvasMaxWidth } from '../viewport/viewport-store'

type Inserting = {
	where: string
	placement: 'before' | 'after' | 'initial'
}

export const insertingAtom = atom<Inserting | null>(null)

export function SimpleCanvas() {
	const maxWidth = useCanvasMaxWidth()
	const elements = useElementsStore((store) => store.elements)
	const generatedStyles = useGenerateStyles(elements)
	const hotkeys = useCanvasHotkeys({ noCopyPaste: true })
	useHotkeys(hotkeys)
	const setInserting = useSetAtom(insertingAtom)
	const isEmpty = elements.length === 0

	const prompt = (
		<div className="flex justify-center pt-10">
			<AddComponentButton inserting={{ where: ROOT_ID, placement: 'initial' }} />
		</div>
	)

	const frame = (
		<Frame
			className="w-full h-full"
			head={<style>{generatedStyles}</style>}
			onClick={() => setInserting(null)}
		>
			<FrameHotkeys>
				<FrameContextConsumer>
					{(frameContext) => (
						<StyleSheetManager target={frameContext.document?.head}>
							<div id={ROOT_ID} style={{ padding: 3 }}>
								<RenderElements elements={elements} isDirectRootChildren />
							</div>
						</StyleSheetManager>
					)}
				</FrameContextConsumer>
			</FrameHotkeys>
		</Frame>
	)

	return (
		<div className="h-full bg-gray-50">
			<div className="h-full mx-auto bg-white" style={{ maxWidth }}>
				{isEmpty ? prompt : frame}
			</div>
		</div>
	)
}

const AddButton = styled.button`
	border: none;
	background-color: #f43f5e;
	border-radius: 4px;
	color: white;
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	padding-right: 12px;
	font-weight: 600;
	cursor: pointer;
	:hover {
		background-color: #e11d48;
	}
`

function AddComponentButton({ inserting }: { inserting: Inserting }) {
	const setInserting = useSetAtom(insertingAtom)

	return (
		<AddButton
			onClick={(event) => {
				event.stopPropagation()
				setInserting(inserting)
			}}
		>
			<TbPlus />
			Section
		</AddButton>
	)
}

function RenderElements({
	elements,
	isDirectRootChildren,
}: {
	elements: Element[]
	isDirectRootChildren: boolean
}) {
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
	const handleClick = () => {
		if (!isDirectRootChild) return
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
			onMouseOver={() => setHovered(element.id)}
			onMouseOut={unsetHovered}
			onMouseEnter={showSettingsHandlers.open}
			onMouseLeave={showSettingsHandlers.close}
			onClick={handleClick}
		>
			{element.render((element) => (
				<RenderElements elements={element.children ?? []} isDirectRootChildren={false} />
			))}
			{isDirectRootChild && showSettings && (
				<>
					<ComponentOverlay
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="top"
						offset={[0, -15]}
					>
						<AddComponentButton
							inserting={{ where: element.id, placement: 'before' }}
						/>
					</ComponentOverlay>
					<ComponentOverlay
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="bottom"
						offset={[0, -15]}
					>
						<AddComponentButton inserting={{ where: element.id, placement: 'after' }} />
					</ComponentOverlay>
					<ComponentOverlay
						referenceElement={referenceElement}
						updateDeps={[element]}
						placement="left-start"
						offset={[8, -30]}
					>
						<ElementActions element={element} />
					</ComponentOverlay>
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

function ComponentOverlay({
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
