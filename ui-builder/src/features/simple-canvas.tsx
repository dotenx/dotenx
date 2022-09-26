import { getHotkeyHandler, useDidUpdate, useDisclosure, useHotkeys } from '@mantine/hooks'
import { Placement } from '@popperjs/core'
import { atom, useSetAtom } from 'jotai'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Frame, { FrameContext, FrameContextConsumer } from 'react-frame-component'
import { TbArrowDown, TbArrowUp, TbPlus, TbTrash } from 'react-icons/tb'
import { usePopper } from 'react-popper'
import styled, { StyleSheetManager } from 'styled-components'
import { ROOT_ID, useCanvasHotkeys, useGenerateStyles } from './canvas'
import { Component, useCanvasStore } from './canvas-store'
import { ComponentShaper, getClasses, useIsHighlighted } from './component-renderer'
import { useSelectionStore } from './selection-store'
import { useMaxWidth } from './viewport-store'

type Inserting = {
	where: string
	placement: 'before' | 'after' | 'initial'
}

export const insertingAtom = atom<Inserting | null>(null)

export function SimpleCanvas() {
	const maxWidth = useMaxWidth()
	const components = useCanvasStore((store) => store.components)
	const isEmpty = components.length === 0
	const generatedStyles = useGenerateStyles()
	const hotkeys = useCanvasHotkeys(true)
	useHotkeys(hotkeys)
	const setInserting = useSetAtom(insertingAtom)

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
								<RenderComponents components={components} />
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

function FrameHotkeys({ children }: { children: ReactNode }) {
	const { window } = useContext(FrameContext)
	const hotkeys = useCanvasHotkeys(true)

	useEffect(() => {
		const hotkeysEvent = getHotkeyHandler(hotkeys as any)
		window?.document.body.addEventListener('keydown', hotkeysEvent)
		return () => window?.document.body.removeEventListener('keydown', hotkeysEvent)
	}, [hotkeys, window?.document.body])

	return <>{children}</>
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

function RenderComponents({ components }: { components: Component[] }) {
	return (
		<>
			{components.map((component) => (
				<RenderComponent key={component.id} component={component} />
			))}
		</>
	)
}

function RenderComponent({ component }: { component: Component }) {
	const { select, setHovered, unsetHovered } = useSelectionStore((store) => ({
		select: store.select,
		setHovered: store.setHovered,
		unsetHovered: store.unsetHovered,
	}))
	const { isHighlighted, isHovered } = useIsHighlighted(component.id)
	const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
	const [showSettings, showSettingsHandlers] = useDisclosure(false)
	const isDirectRootChild = component.parentId === ROOT_ID
	const handleClick = () => {
		if (!isDirectRootChild) return
		select([component.id])
	}

	return (
		<div
			style={{
				outlineWidth: isHovered ? 2 : 1,
				cursor: 'default',
				outlineStyle: isHighlighted && isDirectRootChild ? 'solid' : undefined,
				outlineColor: '#fb7185',
			}}
			className={getClasses(component)}
			ref={setReferenceElement}
			onMouseOver={() => setHovered(component.id)}
			onMouseOut={unsetHovered}
			onMouseEnter={showSettingsHandlers.open}
			onMouseLeave={showSettingsHandlers.close}
			onClick={handleClick}
		>
			<ComponentShaper
				component={component}
				renderFn={(components) => <RenderComponents components={components} />}
			/>
			{isDirectRootChild && showSettings && (
				<>
					<ComponentOverlay
						referenceElement={referenceElement}
						updateDeps={[component]}
						placement="top"
						offset={[0, -15]}
					>
						<AddComponentButton
							inserting={{ where: component.id, placement: 'before' }}
						/>
					</ComponentOverlay>
					<ComponentOverlay
						referenceElement={referenceElement}
						updateDeps={[component]}
						placement="bottom"
						offset={[0, -15]}
					>
						<AddComponentButton
							inserting={{ where: component.id, placement: 'after' }}
						/>
					</ComponentOverlay>
					<ComponentOverlay
						referenceElement={referenceElement}
						updateDeps={[component]}
						placement="left-start"
						offset={[8, -30]}
					>
						<ComponentActions component={component} />
					</ComponentOverlay>
				</>
			)}
		</div>
	)
}

function ComponentActions({ component }: { component: Component }) {
	const { remove, moveUp, moveDown, components } = useCanvasStore((store) => ({
		components: store.components,
		remove: store.deleteComponents,
		moveUp: store.moveUp,
		moveDown: store.moveDown,
	}))
	const isFirst = components.findIndex((c) => c.id === component.id) === 0
	const isLast = components.findIndex((c) => c.id === component.id) === components.length - 1

	return (
		<div>
			<ActionButton
				style={{ borderRadius: '4px 4px 0 0' }}
				onClick={() => moveUp(component.id)}
				disabled={isFirst}
			>
				<TbArrowUp />
			</ActionButton>
			<ActionButton onClick={() => remove([component.id])}>
				<TbTrash />
			</ActionButton>
			<ActionButton
				style={{ borderRadius: '0 0 4px 4px' }}
				onClick={() => moveDown(component.id)}
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
