import { useDidUpdate } from '@mantine/hooks'
import { ModifierPhases, Placement } from '@popperjs/core'
import { useAtomValue } from 'jotai'
import { CSSProperties, useContext, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { FrameContext } from 'react-frame-component'
import { Modifier, usePopper } from 'react-popper'
import { ROOT_ID } from '../frame/canvas'
import { isDraggingAtom } from './draggable'
import { Droppable, DroppableData } from './droppable'

export function DroppablePortal({
	referenceElement,
	data,
	style,
	placement,
	sameWidth,
	sameHeight,
	center,
	updateDeps,
}: {
	referenceElement: HTMLDivElement | null
	data: DroppableData
	style?: CSSProperties
	placement: Placement
	sameWidth?: boolean
	sameHeight?: boolean
	center?: boolean
	updateDeps: unknown[]
}) {
	const { window } = useContext(FrameContext)
	const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
	const modifiers = useMemo<Partial<Modifier<string, object>>[]>(
		() => [
			{
				name: 'offset',
				options: {
					offset: center
						? ({ popper }: { popper: any }) => [0, -popper.height]
						: [0, -10],
				},
			},
			...(sameWidth ? [sameWidthModifier] : []),
			...(sameHeight ? [sameHeightModifier] : []),
		],
		[center, sameHeight, sameWidth]
	)
	const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
		placement,
		modifiers,
	})
	const targetElement = window?.document.querySelector(`#${ROOT_ID}`) ?? document.body
	const dragging = useAtomValue(isDraggingAtom)

	useDidUpdate(() => {
		if (update) update()
	}, [update, ...updateDeps])

	if (!dragging.isDragging) return null

	return ReactDOM.createPortal(
		<Droppable
			ref={setPopperElement}
			style={{ ...styles.popper, ...style }}
			data={data}
			{...attributes.popper}
		/>,
		targetElement
	)
}

const sameWidthModifier: Partial<Modifier<string, object>> = {
	name: 'sameWidth',
	enabled: true,
	phase: 'beforeWrite' as ModifierPhases,
	requires: ['computeStyles'],
	fn({ state }) {
		state.styles.popper.minWidth = `${state.rects.reference.width}px`
	},
	effect({ state }) {
		state.elements.popper.style.minWidth = `${(state.elements.reference as any).offsetWidth}px`
	},
}

const sameHeightModifier: Partial<Modifier<string, object>> = {
	name: 'sameHeight',
	enabled: true,
	phase: 'beforeWrite' as ModifierPhases,
	requires: ['computeStyles'],
	fn({ state }) {
		state.styles.popper.minHeight = `${state.rects.reference.height}px`
	},
	effect({ state }) {
		state.elements.popper.style.minHeight = `${
			(state.elements.reference as any).offsetHeight
		}px`
	},
}
