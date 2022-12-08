import { useDidUpdate } from '@mantine/hooks'
import { ModifierPhases, Placement } from '@popperjs/core'
import { useAtomValue } from 'jotai'
import { CSSProperties, HTMLAttributes, useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { Modifier, usePopper } from 'react-popper'
import { isDraggingAtom } from './draggable'
import { Droppable, DroppableData } from './droppable'

interface DroppablePortalProps extends HTMLAttributes<HTMLDivElement> {
	referenceElement: HTMLDivElement | null
	data: DroppableData
	placement: Placement
	fullWidth?: boolean
	fullHeight?: boolean
	halfHeight?: boolean
	halfWidth?: boolean
	center?: boolean
	updateDeps: unknown[]
	overStyle?: CSSProperties
	targetElement: Element
}

export function DroppablePortal({
	referenceElement,
	data,
	style,
	placement,
	fullWidth,
	fullHeight,
	center,
	updateDeps,
	overStyle,
	halfHeight,
	halfWidth,
	targetElement,
	...rest
}: DroppablePortalProps) {
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
			...(fullWidth ? [fullWidthModifier] : []),
			...(fullHeight ? [fullHeightModifier] : []),
			...(halfWidth ? [halfWidthModifier] : []),
			...(halfHeight ? [halfHeightModifier] : []),
		],
		[center, fullHeight, fullWidth, halfHeight, halfWidth]
	)
	const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
		placement,
		modifiers,
	})
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
			overStyle={overStyle}
			{...rest}
			{...attributes.popper}
		/>,
		targetElement
	)
}

const fullWidthModifier: Partial<Modifier<string, object>> = {
	name: 'fullWidth',
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

const fullHeightModifier: Partial<Modifier<string, object>> = {
	name: 'fullHeight',
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

const halfWidthModifier: Partial<Modifier<string, object>> = {
	name: 'halfWidth',
	enabled: true,
	phase: 'beforeWrite' as ModifierPhases,
	requires: ['computeStyles'],
	fn({ state }) {
		state.styles.popper.minWidth = `${state.rects.reference.width / 2}px`
	},
	effect({ state }) {
		state.elements.popper.style.minWidth = `${
			(state.elements.reference as any).offsetWidth / 2
		}px`
	},
}

const halfHeightModifier: Partial<Modifier<string, object>> = {
	name: 'halfHeight',
	enabled: true,
	phase: 'beforeWrite' as ModifierPhases,
	requires: ['computeStyles'],
	fn({ state }) {
		state.styles.popper.minHeight = `${state.rects.reference.height / 2}px`
	},
	effect({ state }) {
		state.elements.popper.style.minHeight = `${
			(state.elements.reference as any).offsetHeight / 2
		}px`
	},
}
